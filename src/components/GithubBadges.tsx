import { DownloadSimple, Star } from "@phosphor-icons/react";

// Same pill as the filters / stack pills, a touch brighter so the numbers read.
const badge = "h-pill h-pill-static h-pill-stat";

export function GithubStarsBadge({ stars }: { stars: number | null }) {
  if (stars === null) return null;
  return (
    <span className={badge} title={`${stars.toLocaleString()} stars on GitHub`}>
      <Star size={14} weight="fill" className="text-[var(--h-c1)]" />
      {stars.toLocaleString()}
    </span>
  );
}

export function GithubDownloadsBadge({ downloads }: { downloads: number | null }) {
  if (downloads === null) return null;
  return (
    <span className={badge} title={`${downloads.toLocaleString()} direct downloads`}>
      <DownloadSimple size={14} weight="bold" className="text-[var(--h-c1)]" />
      {downloads.toLocaleString()}
    </span>
  );
}
