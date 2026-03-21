import { Download } from "lucide-react";

export function GithubDownloadsBadge({ downloads }: { downloads: number | null }) {
  if (downloads === null) return null;
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-space-muted"
      title={`${downloads.toLocaleString()} downloads on Github`}
    >
      <Download className="w-3 h-3 text-blue-400" />
      <span>{downloads.toLocaleString()}</span>
    </div>
  );
}