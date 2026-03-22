import { useEffect, useState } from "react";

interface PorypalStats {
  unique_cloners:  number;
  total_clones:    number;
  unique_views:    number;
  total_downloads: number;
  last_updated:    string | null;
}

const statsCache: { data: PorypalStats | null } = { data: null };

function sumValues(obj: Record<string, { count: number; uniques: number }>, key: "count" | "uniques") {
  return Object.values(obj).reduce((acc, v) => acc + v[key], 0);
}

function sumReleases(obj: Record<string, number>) {
  return Object.values(obj).reduce((acc, v) => acc + v, 0);
}

export function useGithubStats(enabled = true) {
  const [stats, setStats] = useState<PorypalStats | null>(statsCache.data);

  useEffect(() => {
    if (!enabled) return;
    if (statsCache.data) {
      setStats(statsCache.data);
      return;
    }
    fetch("https://raw.githubusercontent.com/Loxed/porypal/main/stats.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const parsed: PorypalStats = {
          unique_cloners:  sumValues(data.clones  ?? {}, "uniques"),
          total_clones:    sumValues(data.clones  ?? {}, "count"),
          unique_views:    sumValues(data.views   ?? {}, "uniques"),
          total_downloads: sumReleases(data.releases ?? {}),
          last_updated:    data.last_updated ?? null,
        };
        statsCache.data = parsed;
        setStats(parsed);
      })
      .catch(() => {});
  }, [enabled]);

  return stats;
}

// keep these if anything still uses them individually
export function useGithubStars(githubUrl?: string, enabled?: boolean) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled || !githubUrl) return;
    const match = githubUrl.match(/github\.com\/([^/]+\/[^/?#]+)/);
    if (!match) return;
    const repo = match[1];
    fetch(`https://img.shields.io/github/stars/${repo}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const starCount = parseInt(String(d.message).replace(/,/g, ""));
        if (!isNaN(starCount)) setStars(starCount);
      })
      .catch(() => {});
  }, [githubUrl, enabled]);
  return stars;
}

export function useGithubDownloads(githubUrl?: string, enabled?: boolean) {
  const [downloads, setDownloads] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled || !githubUrl) return;
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const [, owner, repo] = match;
    fetch(`https://api.github.com/repos/${owner}/${repo}/releases`)
      .then(r => r.json())
      .then(releases => {
        const total = releases
          .flatMap((r: any) => r.assets)
          .reduce((sum: number, a: any) => sum + a.download_count, 0);
        setDownloads(total);
      })
      .catch(() => {});
  }, [githubUrl, enabled]);
  return downloads;
}