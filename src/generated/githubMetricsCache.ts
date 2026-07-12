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
  "generatedAt": "2026-07-10T19:14:42.813Z",
  "porypal": {
    "unique_cloners": 633,
    "total_clones": 1182,
    "unique_views": 436,
    "total_downloads": 388,
    "last_updated": "2026-07-06T12:44:51.460795"
  },
  "repos": {
    "Loxed/vhdl-calc": {
      "stars": 0,
      "downloads": 0
    },
    "Loxed/AceAttorneyGuide": {
      "stars": 1,
      "downloads": null
    },
    "Loxed/cluedo-knight": {
      "stars": 0,
      "downloads": null
    },
    "chaotics-labs/iisu-icon-maker": {
      "stars": 2,
      "downloads": null
    },
    "Loxed/le-saboteur": {
      "stars": 0,
      "downloads": null
    },
    "Loxed/flight-traffic-simulation": {
      "stars": 0,
      "downloads": null
    },
    "chaotics-labs/Slice": {
      "stars": 1,
      "downloads": null
    },
    "Loxed/PersonaPlayApplication": {
      "stars": 0,
      "downloads": null
    },
    "Loxed/youtube-video-tracker": {
      "stars": 1,
      "downloads": null
    },
    "Loxed/porypal": {
      "stars": 26,
      "downloads": null
    },
    "Loxed/marque": {
      "stars": 2,
      "downloads": null
    }
  }
};
