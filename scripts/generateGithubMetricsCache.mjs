import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const projectsDir = path.join(repoRoot, "src", "resources", "projects");
const generatedDir = path.join(repoRoot, "src", "generated");
const generatedFile = path.join(generatedDir, "githubMetricsCache.ts");

function getRepoSlug(githubUrl) {
  if (typeof githubUrl !== "string") return null;
  const match = githubUrl.match(/github\.com\/([^/]+\/[^/?#]+)/);
  return match ? match[1] : null;
}

function getOwnerAndRepo(githubUrl) {
  if (typeof githubUrl !== "string") return null;
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "chaotics-lab-cache-generator",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function sumReleaseDownloads(releases) {
  return releases
    .flatMap((release) => release.assets ?? [])
    .reduce((sum, asset) => sum + (asset.download_count ?? 0), 0);
}

async function loadProjects() {
  const files = await readdir(projectsDir);
  const projects = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const raw = await readFile(path.join(projectsDir, file), "utf8");
    projects.push(JSON.parse(raw));
  }

  return projects;
}

const projects = await loadProjects();
const metrics = {
  generatedAt: new Date().toISOString(),
  porypal: null,
  repos: {},
};

for (const project of projects) {
  const githubSlug = getRepoSlug(project.githubUrl);
  if (!githubSlug) continue;

  const repoInfo = getOwnerAndRepo(project.githubUrl);
  const repoMetrics = {
    stars: null,
    downloads: null,
  };

  try {
    const starsData = await fetchJson(`https://img.shields.io/github/stars/${githubSlug}.json`);
    const stars = Number.parseInt(String(starsData.message).replace(/,/g, ""), 10);
    repoMetrics.stars = Number.isFinite(stars) ? stars : null;
  } catch {
    repoMetrics.stars = null;
  }

  if (repoInfo) {
    try {
      const releases = await fetchJson(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/releases`);
      repoMetrics.downloads = sumReleaseDownloads(releases);
    } catch {
      repoMetrics.downloads = null;
    }
  }

  metrics.repos[githubSlug] = repoMetrics;

  if (project.id === "porypal") {
    try {
      const stats = await fetchJson("https://raw.githubusercontent.com/Loxed/porypal/main/scripts/stats.json");
      metrics.porypal = {
        unique_cloners: Object.values(stats.clones ?? {}).reduce((sum, entry) => sum + (entry.uniques ?? 0), 0),
        total_clones: Object.values(stats.clones ?? {}).reduce((sum, entry) => sum + (entry.count ?? 0), 0),
        unique_views: Object.values(stats.views ?? {}).reduce((sum, entry) => sum + (entry.uniques ?? 0), 0),
        total_downloads: Object.values(stats.releases ?? {}).reduce((sum, value) => sum + value, 0),
        last_updated: stats.last_updated ?? null,
      };
    } catch {
      metrics.porypal = null;
    }
  }
}

await mkdir(generatedDir, { recursive: true });
await writeFile(
  generatedFile,
  [
    "export interface GithubMetricsPorypalStats {",
    "  unique_cloners: number;",
    "  total_clones: number;",
    "  unique_views: number;",
    "  total_downloads: number;",
    "  last_updated: string | null;",
    "}",
    "",
    "export interface GithubRepoMetrics {",
    "  stars: number | null;",
    "  downloads: number | null;",
    "}",
    "",
    "export interface GithubMetricsCache {",
    "  generatedAt: string;",
    "  porypal: GithubMetricsPorypalStats | null;",
    "  repos: Record<string, GithubRepoMetrics>;",
    "}",
    "",
    `export const githubMetricsCache: GithubMetricsCache = ${JSON.stringify(metrics, null, 2)};`,
    "",
  ].join("\n"),
  "utf8",
);
