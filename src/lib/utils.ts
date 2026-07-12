import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toWebpPublicAssetPath(value: string): string {
  if (!value) return "";
  if (/^(https?:)?\/\//.test(value)) return value.replace(/\.png$/i, ".webp");

  const normalized = value.startsWith("public/") ? `/${value.slice("public/".length)}` : value;
  return normalized.replace(/\.png$/i, ".webp");
}

