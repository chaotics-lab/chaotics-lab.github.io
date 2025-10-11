// parseMarkdown.ts
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  type: 'active' | 'beta' | 'archived';
  content?: string;
  slug: string;
}

// Simple frontmatter parser for browser
export const parseMD = (md: string, slug: string): ProjectData => {
  const frontmatterMatch = md.match(/^---\n([\s\S]+?)\n---/);
  let data: any = {};
  let content = md;

  if (frontmatterMatch) {
    const fm = frontmatterMatch[1];
    content = md.slice(frontmatterMatch[0].length).trim();

    fm.split('\n').forEach(line => {
      const [key, ...rest] = line.split(':');
      if (!key) return;
      const value = rest.join(':').trim();
      try {
        data[key.trim()] = JSON.parse(value); // parse arrays/booleans if JSON
      } catch {
        data[key.trim()] = value; // fallback to string
      }
    });
  }

  return {
    slug,
    ...data,
    content,
  } as ProjectData;
};
