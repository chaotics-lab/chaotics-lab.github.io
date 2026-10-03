import { DownloadSimple, Star } from "@phosphor-icons/react";

const badge = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border-[1.5px] border-[var(--h-c2)]/35 text-[var(--h-c3)]";

export function GithubStarsBadge({ stars }: { stars: number | null }) {
  if (stars === null) return null;
  return (
    <span className={badge} title={`${stars.toLocaleString()} stars on GitHub`}>
      <Star size={12} weight="fill" className="text-[var(--h-c1)]" />
      {stars.toLocaleString()}
    </span>
  );
}

export function GithubDownloadsBadge({ downloads }: { downloads: number | null }) {
  if (downloads === null) return null;
  return (
    <span className={badge} title={`${downloads.toLocaleString()} direct downloads`}>
      <DownloadSimple size={12} weight="bold" className="text-[var(--h-c1)]" />
      {downloads.toLocaleString()}
    </span>
  );
}
