import { Star, Download, GitFork } from "lucide-react";

export function GithubStarsBadge({ stars }: { stars: number | null }) {
  if (stars === null) return null;
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-space-muted"
      title={`${stars.toLocaleString()} stars on Github`}
    >
      <Star className="w-3 h-3 text-yellow-400" />
      <span>{stars.toLocaleString()}</span>
    </div>
  );
}

export function GithubDownloadsBadge({ downloads }: { downloads: number | null }) {
  if (downloads === null) return null;
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-space-muted"
      title={`${downloads.toLocaleString()} direct downloads`}
    >
      <Download className="w-3 h-3 text-blue-400" />
      <span>{downloads.toLocaleString()}</span>
    </div>
  );
}

export function GithubClonersBadge({ cloners }: { cloners: number | null }) {
  if (cloners === null) return null;
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-space-muted"
      title={`${cloners.toLocaleString()} unique cloners`}
    >
      <GitFork className="w-3 h-3 text-green-400" />
      <span>{cloners.toLocaleString()}</span>
    </div>
  );
}