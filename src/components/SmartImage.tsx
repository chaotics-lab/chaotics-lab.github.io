import { useEffect, useState } from "react";

const REMOTE_PROTOCOL_RE = /^(https?:)?\/\//;
const EXTENSION_RE = /\.(webp|gif|jpe?g|png)$/i;

function buildCandidates(src: string): string[] {
  if (!src) return [];
  if (REMOTE_PROTOCOL_RE.test(src) || src.startsWith("data:")) return [src];

  const [pathPart, queryPart = ""] = src.split("?");
  const query = queryPart ? `?${queryPart}` : "";
  const base = pathPart.replace(EXTENSION_RE, "");
  const seen = new Set<string>();
  const add = (value: string) => {
    if (!seen.has(value)) {
      seen.add(value);
      candidates.push(value);
    }
  };

  const candidates: string[] = [];

  if (EXTENSION_RE.test(pathPart)) {
    add(`${base}.webp${query}`);
    add(`${base}.gif${query}`);
    add(`${base}.jpg${query}`);
    add(`${base}.jpeg${query}`);
    add(`${base}.png${query}`);
  } else {
    add(`${pathPart}.webp${query}`);
    add(`${pathPart}.gif${query}`);
    add(`${pathPart}.jpg${query}`);
    add(`${pathPart}.jpeg${query}`);
    add(`${pathPart}.png${query}`);
  }

  return candidates;
}

export function resolveBestPublicImageSrc(src: string): Promise<string> {
  const candidates = buildCandidates(src);
  if (candidates.length === 0) return Promise.resolve("");
  if (candidates.length === 1) return Promise.resolve(candidates[0]);

  return new Promise((resolve) => {
    let cancelled = false;
    let index = 0;

    const tryNext = () => {
      if (cancelled) return;
      const candidate = candidates[index++];
      if (!candidate) {
        resolve(src);
        return;
      }

      const image = new Image();
      image.onload = () => {
        if (!cancelled) resolve(candidate);
      };
      image.onerror = () => {
        if (index >= candidates.length) {
          if (!cancelled) resolve(src);
          return;
        }
        tryNext();
      };
      image.src = candidate;
    };

    tryNext();

    return () => {
      cancelled = true;
    };
  });
}

export function SmartImage({ src, alt, className, style, loading, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [resolvedSrc, setResolvedSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setResolvedSrc("");
      return;
    }

    const candidates = buildCandidates(src);
    if (candidates.length <= 1) {
      setResolvedSrc(candidates[0] ?? src);
      return;
    }

    let index = 0;
    const tryNext = () => {
      const candidate = candidates[index++];
      if (!candidate) {
        if (!cancelled) setResolvedSrc(src);
        return;
      }

      const image = new Image();
      image.onload = () => {
        if (!cancelled) setResolvedSrc(candidate);
      };
      image.onerror = () => {
        if (index < candidates.length) tryNext();
        else if (!cancelled) setResolvedSrc(src);
      };
      image.src = candidate;
    };

    tryNext();

    return () => {
      cancelled = true;
    };
  }, [src]);

  return <img src={resolvedSrc || undefined} alt={alt} className={className} style={style} loading={loading} {...props} />;
}