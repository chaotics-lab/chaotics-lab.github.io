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
  "generatedAt": "2026-10-03T16:37:42.901Z",
  "porypal": {
    "unique_cloners": 853,
    "total_clones": 1651,
    "unique_views": 727,
    "total_downloads": 511,
    "last_updated": "2026-09-28T17:20:56.081428"
  },
  "repos": {
    "Loxed/vhdl-calc": {
      "stars": null,
      "downloads": null
    },
    "Loxed/AceAttorneyGuide": {
      "stars": null,
      "downloads": null
    },
    "Loxed/flight-traffic-simulation": {
      "stars": null,
      "downloads": null
    },
    "chaotics-labs/Slice": {
      "stars": null,
      "downloads": null
    },
    "Loxed/cluedo-knight": {
      "stars": null,
      "downloads": null
    },
    "chaotics-labs/iisu-icon-maker": {
      "stars": null,
      "downloads": null
    },
    "Loxed/le-saboteur": {
      "stars": null,
      "downloads": null
    },
    "Loxed/marque": {
      "stars": null,
      "downloads": null
    },
    "Loxed/PersonaPlayApplication": {
      "stars": null,
      "downloads": null
    },
    "Loxed/porypal": {
      "stars": null,
      "downloads": null
    },
    "Loxed/youtube-video-tracker": {
      "stars": null,
      "downloads": null
    }
  }
};
