export interface GithubMetricsPorypalStats {
  unique_cloners: number;
  total_clones: number;
  unique_views: number;
  total_downloads: number;
  last_updated: string | null;
}

export interface GithubRepoMetrics {
  stars: number | null;
  downloads: number | null;
}

export interface GithubMetricsCache {
  generatedAt: string;
  porypal: GithubMetricsPorypalStats | null;
  repos: Record<string, GithubRepoMetrics>;
}

export const githubMetricsCache: GithubMetricsCache = {
  "generatedAt": "2026-10-02T19:42:28.041Z",
  "porypal": {
    "unique_cloners": 853,
    "total_clones": 1651,
    "unique_views": 727,
    "total_downloads": 511,
    "last_updated": "2026-09-28T17:20:56.081428"
  },
  "repos": {
    "Loxed/vhdl-calc": {
      "stars": 0,
      "downloads": 0
    },
    "Loxed/AceAttorneyGuide": {
      "stars": 1,
      "downloads": 0
    },
    "Loxed/flight-traffic-simulation": {
      "stars": 0,
      "downloads": 0
    },
    "chaotics-labs/Slice": {
      "stars": 1,
      "downloads": 32
    },
    "Loxed/cluedo-knight": {
      "stars": 0,
      "downloads": 0
    },
    "chaotics-labs/iisu-icon-maker": {
      "stars": 2,
      "downloads": 0
    },
    "Loxed/le-saboteur": {
      "stars": 0,
      "downloads": 0
    },
    "Loxed/marque": {
      "stars": 2,
      "downloads": 0
    },
    "Loxed/PersonaPlayApplication": {
      "stars": 0,
      "downloads": 0
    },
    "Loxed/porypal": {
      "stars": 30,
      "downloads": 673
    },
    "Loxed/youtube-video-tracker": {
      "stars": 1,
      "downloads": 0
    }
  }
};
