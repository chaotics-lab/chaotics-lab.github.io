import { useEffect, useState } from "react";

export function useGithubDownloads(githubUrl?: string, enabled?: boolean) {
  const [downloads, setDownloads] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !githubUrl) return;

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;

    const [, owner, repo] = match;

    fetch(`https://api.github.com/repos/${owner}/${repo}/releases`)
      .then((r) => r.json())
      .then((releases) => {
        const total = releases
          .flatMap((r: any) => r.assets)
          .reduce((sum: number, a: any) => sum + a.download_count, 0);
        setDownloads(total);
      })
      .catch(() => {});
  }, [githubUrl, enabled]);

  return downloads;
}