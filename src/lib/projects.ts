import type { ProjectData } from '@/components/portfolio/types';
import { projectOrder } from '@/config/projectOrder';

export type Project = ProjectData & {
  showGithubStats?: boolean;
  demoUrl?: string;
  logoUrl?: string;
  logoBackgroundColor?: string;
  markdown?: string;
  type?: string;
};

// All projects from src/resources/projects, pinned ones first (config
// order), the rest newest first.
function load(): Project[] {
  const modules = import.meta.glob<{ default: Project }>('../resources/projects/*.json', { eager: true });
  const loaded = Object.values(modules).map(m => m.default ?? (m as unknown as Project));
  const byDate = (a: Project, b: Project) =>
    a.date && b.date ? new Date(b.date).getTime() - new Date(a.date).getTime() : a.title.localeCompare(b.title);
  if (!projectOrder.enabled) return loaded.sort(byDate);
  return loaded.sort((a, b) => {
    const ai = projectOrder.order.indexOf(a.id);
    const bi = projectOrder.order.indexOf(b.id);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return byDate(a, b);
  });
}

export const PROJECTS = load();

// "Embedded Power Profiler @Withings" -> "Embedded Power Profiler". The
// @Company part is shown on the cards only.
export const withoutCompany = (title: string) => title.replace(/\s*@\S.*$/, '').trim() || title;
