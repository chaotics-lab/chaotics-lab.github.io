export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage?: string;
  pinned?: boolean;
  featured?: boolean;
  content: string;
  series?: string;
}

export interface BlogSeries {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  pinned?: boolean;
  featured?: boolean;
  tags: string[];
  intro: string;
  posts: BlogPost[];
}

function normalizePublicAssetPath(value: string): string {
  if (!value) return "";
  if (/^(https?:)?\/\//.test(value)) return value;
  if (value.startsWith("public/")) return `/${value.slice("public/".length)}`;
  return value.startsWith("/") ? value : `/${value}`;
}

function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw.trim() };

  const data: Record<string, string | string[]> = {};

  const lines = match[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) { i++; continue; }

    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();

    if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
        : [];
      i++;
    } else if (val === "") {
      const items: string[] = [];
      i++;
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""));
        i++;
      }
      data[key] = items.length > 0 ? items : "";
    } else {
      data[key] = val.replace(/^["']|["']$/g, "");
      i++;
    }
  }

  return { data, content: match[2].trim() };
}

function parseBool(val: string | string[] | undefined): boolean {
  return val === "true" || val === true;
}

const rawModules = import.meta.glob("../resources/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const seriesModules = import.meta.glob("../resources/blog/*/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function slugFromPath(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

function seriesIdFromPath(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 2].toLowerCase();
}

function parsePost(path: string, raw: string, seriesId?: string): BlogPost {
  const { data, content } = parseFrontmatter(raw);
  return {
    slug: slugFromPath(path),
    title: (data.title as string) ?? "Untitled",
    date: (data.date as string) ?? "",
    description: (data.description as string) || (data.summary as string) || "",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    coverImage: normalizePublicAssetPath((data.coverImage as string) ?? ""),
    pinned: parseBool(data.pinned),
    featured: parseBool(data.featured),
    content,
    ...(seriesId ? { series: seriesId } : {}),
  };
}

export function getAllPosts(): BlogPost[] {
  return Object.entries(rawModules)
    .map(([path, raw]) => parsePost(path, raw))
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllSeries(): BlogSeries[] {
  const postMap  = new Map<string, BlogPost[]>();
  const indexMap = new Map<string, string>();

  for (const [path, raw] of Object.entries(seriesModules)) {
    const id = seriesIdFromPath(path);
    const isIndex = path.endsWith("/index.md") || slugFromPath(path) === "index";

    if (isIndex) {
      indexMap.set(id, raw);
    } else {
      const post = parsePost(path, raw, id);
      if (!postMap.has(id)) postMap.set(id, []);
      postMap.get(id)!.push(post);
    }
  }

  const allIds = new Set([...postMap.keys(), ...indexMap.keys()]);

  return Array.from(allIds).map((id) => {
    let title       = id.charAt(0).toUpperCase() + id.slice(1);
    let description = "";
    let coverImage: string | undefined;
    let pinned: boolean | undefined;
    let featured: boolean | undefined;
    let tags: string[]  = [];
    let intro           = "";
    let order: string[] = [];

    const indexRaw = indexMap.get(id);
    if (indexRaw) {
      const { data, content } = parseFrontmatter(indexRaw);
      title       = (data.title       as string) ?? title;
      description = (data.description as string) ?? "";
      coverImage  = normalizePublicAssetPath((data.coverImage as string) ?? "");
      tags        = Array.isArray(data.tags)  ? (data.tags  as string[]) : [];
      order       = Array.isArray(data.order) ? (data.order as string[]) : [];
      pinned      = parseBool(data.pinned);
      featured    = parseBool(data.featured);
      intro       = content;
    }

    let posts = postMap.get(id) ?? [];

    if (order.length > 0) {
      posts.sort((a, b) => {
        const ai = order.indexOf(a.slug);
        const bi = order.indexOf(b.slug);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        if (!a.date && !b.date) return a.slug.localeCompare(b.slug);
        if (!a.date) return 1;
        if (!b.date) return -1;
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
      });
    } else {
      posts.sort((a, b) => {
        if (!a.date && !b.date) return a.slug.localeCompare(b.slug);
        if (!a.date) return 1;
        if (!b.date) return -1;
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
      });
    }

    return { id, title, description, coverImage, pinned, featured, tags, intro, posts };
  });
}

export function getSeriesById(id: string): BlogSeries | undefined {
  return getAllSeries().find((s) => s.id === id.toLowerCase());
}

export function getSeriesPost(seriesId: string, slug: string): BlogPost | undefined {
  return getSeriesById(seriesId)?.posts.find((p) => p.slug === slug);
}