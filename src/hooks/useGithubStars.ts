import { useEffect, useState } from "react";

const starCache: Record<string, number> = {};

export function useGithubStars(githubUrl?: string, enabled?: boolean) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !githubUrl) return;

    const match = githubUrl.match(/github\.com\/([^/]+\/[^/?#]+)/);
    if (!match) return;

    const repo = match[1];

    if (starCache[repo] !== undefined) {
      setStars(starCache[repo]);
      return;
    }

    fetch(`https://img.shields.io/github/stars/${repo}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;

        const starCount = parseInt(String(d.message).replace(/,/g, ""));
        if (!isNaN(starCount)) {
          starCache[repo] = starCount;
          setStars(starCount);
        }
      })
      .catch(() => {});
  }, [githubUrl, enabled]);

  return stars;
}