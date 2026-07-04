import { copyFile, mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const projectsDir = path.join(repoRoot, "src", "resources", "projects");
const projectOrderFile = path.join(repoRoot, "src", "config", "projectOrder.ts");
const publicDir = path.join(repoRoot, "public");
const outputDir = path.join(publicDir, "llm", "projects");
const dataDir = path.join(outputDir, "data");

const routePath = "/llm/projects/";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function encodePathSegment(value) {
  return encodeURIComponent(value).replaceAll("%2F", "/");
}

function toAbsoluteUrl(siteOrigin, route) {
  if (!siteOrigin) return route;
  return new URL(route, siteOrigin).toString();
}

function safeJsonForScript(json) {
  return json
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

async function readSiteOrigin() {
  try {
    const cname = (await readFile(path.join(publicDir, "CNAME"), "utf8")).trim();
    return cname ? `https://${cname}` : "";
  } catch {
    return "";
  }
}

async function readProjectOrder() {
  try {
    const raw = await readFile(projectOrderFile, "utf8");
    if (!/enabled:\s*true/.test(raw)) return [];

    const orderBlock = raw.match(/order:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const uncommented = orderBlock.replace(/\/\/.*$/gm, "");
    return [...uncommented.matchAll(/['"`]([^'"`]+)['"`]/g)].map((match) => match[1]);
  } catch {
    return [];
  }
}

async function loadProjects() {
  const files = (await readdir(projectsDir)).filter((file) => file.endsWith(".json")).sort();
  const projects = [];

  for (const file of files) {
    const sourcePath = path.join(projectsDir, file);
    const raw = await readFile(sourcePath, "utf8");
    const project = JSON.parse(raw);
    projects.push({ file, sourcePath, project });
  }

  return projects;
}

function compareProjects(projectOrder) {
  const orderIndex = new Map(projectOrder.map((id, index) => [id, index]));

  return (left, right) => {
    const leftOrder = orderIndex.get(left.project.id);
    const rightOrder = orderIndex.get(right.project.id);

    if (leftOrder !== undefined && rightOrder !== undefined) return leftOrder - rightOrder;
    if (leftOrder !== undefined) return -1;
    if (rightOrder !== undefined) return 1;

    const leftTime = Date.parse(left.project.date ?? "");
    const rightTime = Date.parse(right.project.date ?? "");
    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return String(left.project.title ?? left.file).localeCompare(String(right.project.title ?? right.file));
  };
}

function buildProjectRecord(entry, siteOrigin) {
  const sourceJson = `${routePath}data/${encodePathSegment(entry.file)}`;
  const portfolioPage = entry.project.id ? `/project/${encodePathSegment(entry.project.id)}` : null;

  return {
    ...entry.project,
    _meta: {
      sourceFile: `src/resources/projects/${entry.file}`,
      sourceJson,
      canonicalSourceJson: toAbsoluteUrl(siteOrigin, sourceJson),
      portfolioPage,
      canonicalPortfolioPage: portfolioPage ? toAbsoluteUrl(siteOrigin, portfolioPage) : null,
    },
  };
}

function renderList(values) {
  if (!Array.isArray(values) || values.length === 0) return "None listed";
  return values.map(escapeHtml).join(", ");
}

function renderProjectArticle(project) {
  const meta = project._meta;
  const markdown = project.markdown || "No long-form markdown provided.";
  const links = [
    project.githubUrl ? `<a href="${escapeHtml(project.githubUrl)}">GitHub</a>` : "",
    project.demoUrl ? `<a href="${escapeHtml(project.demoUrl)}">Demo</a>` : "",
    meta.portfolioPage ? `<a href="${escapeHtml(meta.portfolioPage)}">Portfolio page</a>` : "",
    `<a href="${escapeHtml(meta.sourceJson)}">Source JSON</a>`,
  ].filter(Boolean);

  return `
      <article id="${escapeHtml(project.id)}">
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <dl>
          <dt>ID</dt><dd><code>${escapeHtml(project.id)}</code></dd>
          <dt>Date</dt><dd>${escapeHtml(project.date || "Unknown")}</dd>
          <dt>Type</dt><dd>${escapeHtml(project.type || "Unknown")}</dd>
          <dt>Categories</dt><dd>${renderList(project.category)}</dd>
          <dt>Tags</dt><dd>${renderList(project.tags || project.technologies)}</dd>
          <dt>Links</dt><dd>${links.join(" · ")}</dd>
        </dl>
        <h4>Details</h4>
        <pre>${escapeHtml(markdown)}</pre>
      </article>`;
}

function renderHtml({ manifest, projects, siteOrigin }) {
  const json = JSON.stringify(manifest, null, 2);
  const scriptJson = safeJsonForScript(json);
  const canonical = toAbsoluteUrl(siteOrigin, routePath);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>Chaotics Lab Projects for LLMs</title>
    <meta name="description" content="Static, scrape-friendly project data from Chaotics Lab, including every portfolio project JSON file and markdown description." />
    ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : ""}
    <link rel="alternate" type="application/json" href="./projects.json" title="Aggregated Chaotics Lab project JSON" />
    <style>
      :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.55; }
      body { margin: 0; background: #0b1020; color: #eef2ff; }
      main { max-width: 980px; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
      a { color: #93c5fd; }
      h1, h2, h3 { line-height: 1.15; }
      h1 { font-size: clamp(2rem, 6vw, 4rem); margin: 0 0 1rem; }
      h2 { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,.16); }
      article { margin: 2rem 0; padding: 1.25rem; border: 1px solid rgba(255,255,255,.16); border-radius: 1rem; background: rgba(255,255,255,.045); }
      dl { display: grid; grid-template-columns: minmax(7rem, 12rem) 1fr; gap: .35rem 1rem; }
      dt { color: #c4b5fd; font-weight: 700; }
      dd { margin: 0; }
      pre { overflow-x: auto; white-space: pre-wrap; word-break: break-word; padding: 1rem; border-radius: .75rem; background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.12); }
      code { font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace; font-size: .92em; }
      .lede { color: #cbd5e1; font-size: 1.1rem; }
      .pill-list { display: flex; flex-wrap: wrap; gap: .55rem; padding: 0; list-style: none; }
      .pill-list a { display: inline-block; padding: .35rem .65rem; border: 1px solid rgba(147,197,253,.35); border-radius: 999px; text-decoration: none; background: rgba(147,197,253,.08); }
    </style>
  </head>
  <body>
    <main>
      <h1>Chaotics Lab Projects for LLMs</h1>
      <p class="lede">This is a deliberately static, no-JavaScript page for crawlers and online LLMs. It aggregates every JSON file from <code>src/resources/projects</code> into one scrape-friendly place.</p>

      <h2>Machine-Readable Endpoints</h2>
      <ul>
        <li><a href="./projects.json">Aggregated JSON dataset</a></li>
        <li><a href="./data/">Individual project JSON files directory</a></li>
      </ul>

      <h2>Individual Project JSON Files</h2>
      <ul class="pill-list">
        ${projects.map((project) => `<li><a href="${escapeHtml(project._meta.sourceJson)}">${escapeHtml(project.title)}</a></li>`).join("\n        ")}
      </ul>

      <h2>Embedded Aggregated JSON</h2>
      <p>The same dataset is embedded here for scrapers that prefer a single HTML document.</p>
      <script type="application/json" id="chaotics-lab-projects">${scriptJson}</script>
      <pre><code>${escapeHtml(json)}</code></pre>

      <h2>Project Summaries</h2>
      ${projects.map(renderProjectArticle).join("\n")}
    </main>
  </body>
</html>
`;
}

function renderDataIndexHtml(projects) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>Chaotics Lab Individual Project JSON Files</title>
  </head>
  <body>
    <main>
      <h1>Chaotics Lab Individual Project JSON Files</h1>
      <p>These files are copied from <code>src/resources/projects/*.json</code> for static crawler access.</p>
      <ul>
        ${projects.map((project) => `<li><a href="./${escapeHtml(path.basename(project._meta.sourceJson))}">${escapeHtml(project.title)}</a></li>`).join("\n        ")}
      </ul>
      <p><a href="../projects.json">Aggregated JSON dataset</a> · <a href="../">LLM projects page</a></p>
    </main>
  </body>
</html>
`;
}

const siteOrigin = await readSiteOrigin();
const projectOrder = await readProjectOrder();
const entries = (await loadProjects()).sort(compareProjects(projectOrder));
const projects = entries.map((entry) => buildProjectRecord(entry, siteOrigin));
const manifest = {
  schema: "chaotics-lab.llm-projects.v1",
  description: "Static, scrape-friendly dataset of Chaotics Lab portfolio projects.",
  sourceGlob: "src/resources/projects/*.json",
  projectCount: projects.length,
  routes: {
    html: routePath,
    json: `${routePath}projects.json`,
    dataDirectory: `${routePath}data/`,
  },
  projects,
};

await mkdir(outputDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

const staleFiles = await readdir(dataDir);
await Promise.all(
  staleFiles
    .filter((file) => file.endsWith(".json"))
    .map((file) => unlink(path.join(dataDir, file))),
);

for (const entry of entries) {
  await copyFile(entry.sourcePath, path.join(dataDir, entry.file));
}

await writeFile(path.join(outputDir, "projects.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(path.join(outputDir, "index.html"), renderHtml({ manifest, projects, siteOrigin }), "utf8");
await writeFile(path.join(dataDir, "index.html"), renderDataIndexHtml(projects), "utf8");

console.log(`Generated ${routePath} with ${projects.length} projects.`);
