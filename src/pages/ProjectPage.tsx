import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight, ArrowUpRight, GithubLogo } from '@phosphor-icons/react';
import { SiteLayout } from '@/components/site/SiteLayout';
import { TransitionLink } from '@/components/site/TransitionLink';
import { AITag } from '@/components/home/AITag';
import { Gallery } from '@/components/portfolio/Gallery';
import { RepoStats } from '@/components/RepoStats';
import { useGithubStars } from '@/hooks/useGithubStars';
import { useGithubStats } from '@/hooks/useGithubStats';
import { categoryLabel } from '@/config/categories';
import { aiLevel } from '@/config/aiLevels';
import { PROJECTS, withoutCompany, type Project } from '@/lib/projects';
import { usePageTransition, type TransitionOpts } from '@/lib/pageTransition';
import { projectPalette, setProjectPalette } from '@/lib/theme';

// Finds the numbered images in a project's folder (1.png, 2.gif, ...),
// trying each extension in turn, and reveals them as they load.
function useFrames(base?: string) {
  const [frames, setFrames] = useState<string[]>([]);
  useEffect(() => {
    setFrames([]);
    if (!base) return;
    let alive = true;
    const found: string[] = [];
    const probe = (i: number, exts = ['png', 'gif', 'jpg', 'webp']) => {
      if (!exts.length || !alive) return;
      const img = new Image();
      img.onload = () => {
        if (!alive) return;
        found.push(img.src);
        setFrames([...found]);
        probe(i + 1);
      };
      img.onerror = () => probe(i, exts.slice(1));
      img.src = `${base}/${i}.${exts[0]}`;
    };
    probe(1);
    return () => { alive = false; };
  }, [base]);
  return frames;
}

// Back to the projects: the sea sweeps across left to right.
const BACK: TransitionOpts = { dir: 'right' };

// Project to project: slanted bands in that project's colours, from the
// right going forward, from the left going back.
const slashTo = (p: Project, dir: 'left' | 'right' = 'right'): TransitionOpts => {
  const pal = projectPalette(p.themeColors);
  return { kind: 'slash', dir, label: withoutCompany(p.title), colors: pal ? [pal.c1, pal.top, pal.deep] : undefined };
};

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const index = PROJECTS.findIndex(p => p.id === projectId);
  const project = index >= 0 ? PROJECTS[index] : undefined;
  const next = index >= 0 && PROJECTS.length > 1 ? PROJECTS[(index + 1) % PROJECTS.length] : undefined;
  const prev = index >= 0 && PROJECTS.length > 1 ? PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length] : undefined;
  const { go } = usePageTransition();
  const frames = useFrames(project?.imageUrl);
  const stars = useGithubStars(project?.githubUrl, project?.showGithubStats);
  const stats = useGithubStats(project?.showGithubStats);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleH, setTitleH] = useState(0);

  // The page takes the project's colours; leaving it brings the element
  // scheme back. Layout effect, so it swaps while the transition covers.
  useLayoutEffect(() => {
    setProjectPalette(projectPalette(project?.themeColors));
    return () => setProjectPalette(null);
  }, [project]);

  // The logo beside the title matches the title's height (1-3 lines).
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTitleH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [projectId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectId]);

  // Left / right arrow keys: previous / next project (not while typing, with
  // a modifier held, or while the full-screen image viewer is open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
      if ((e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]') || document.querySelector('.p-viewer')) return;
      const to = e.key === 'ArrowLeft' ? prev : next;
      if (!to) return;
      e.preventDefault();
      go(`/project/${to.id}`, slashTo(to, e.key === 'ArrowLeft' ? 'left' : 'right'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, go]);

  useEffect(() => {
    document.title = project ? `${withoutCompany(project.title)} | Lox` : 'Project not found | Lox';
  }, [project]);

  if (!project) {
    return (
      <SiteLayout>
        <main className="container mx-auto px-5 sm:px-8 pt-40 pb-10">
          <p className="h-caps text-xs text-[var(--h-c2)]">404</p>
          <h1 className="mt-4 h-display text-[clamp(3rem,9vw,7rem)]">Project not found</h1>
          <p className="mt-6 text-lg text-[var(--h-c3)]">There's no project with the id "{projectId}".</p>
          <TransitionLink to="/#projects" className="mt-10 h-btn h-btn-cream"><ArrowLeft size={16} weight="bold" /> All projects</TransitionLink>
        </main>
      </SiteLayout>
    );
  }

  const when = project.date ? new Date(project.date).toLocaleString('en', { month: 'long', year: 'numeric' }) : null;
  const categories = (project.category ?? []).map(categoryLabel).filter(Boolean);
  const stack = project.tags?.length ? project.tags : project.technologies ?? [];
  const ai = project.AIUsed ? parseInt(project.AIUsed, 10) : null;

  const back = (cls = '') => (
    <TransitionLink to="/#projects" transition={BACK} className={`h-btn h-btn-line h-swap-host ${cls}`}>
      <ArrowLeft size={16} weight="bold" />
      <span className="h-swap">
        <span>All projects</span>
        <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">All projects</span>
      </span>
    </TransitionLink>
  );

  return (
    <SiteLayout>
      <main className="relative pt-24 md:pt-28">
        <div
          className="absolute -top-[20vh] -right-[20vw] w-[80vw] h-[70vh] pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgb(var(--h-c2-rgb) / 0.28), transparent)' }}
          aria-hidden="true"
        />

        {/* PCs: everything that says what the project is on the left, the
            images on the right from the top, so both fit in a short window.
            Phones: title, images, then the rest. */}
        <section className="relative container mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-14 xl:gap-x-16">
          {frames.length > 0 && (
            <div className="hidden lg:block lg:order-2 lg:sticky lg:top-24 self-start min-w-0">
              <Gallery key={project.id} frames={frames} title={withoutCompany(project.title)} />
            </div>
          )}

          <div className="min-w-0 lg:order-1">
            {/* buttons and pills are the home page's (h-btn-line, h-pill) */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {back()}
              <p className="h-caps text-[0.68rem] text-[var(--h-c2)]">{[categories.join(' / '), when].filter(Boolean).join(' · ')}</p>
            </div>

            {/* Logo sits left of the title, as tall as the title */}
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5">
              {project.logoUrl && <img src={project.logoUrl} alt="" className="p-logo" style={titleH ? { height: titleH } : undefined} />}
              <h1 ref={titleRef} className="h-display text-[clamp(1.8rem,6.5vw,3rem)] lg:text-[clamp(2rem,3.3vw,3.4rem)] break-words min-w-0 max-w-full">
                <span className="h-line"><span>{withoutCompany(project.title)}</span></span>
              </h1>
            </div>

            {/* phones: the images come right after the title */}
            {frames.length > 0 && (
              <div className="mt-6 lg:hidden">
                <Gallery key={`m-${project.id}`} frames={frames} title={withoutCompany(project.title)} />
              </div>
            )}

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--h-c3)]">{project.description}</p>

            {(project.githubUrl || project.demoUrl || project.showGithubStats) && (
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5">
                {(project.githubUrl || project.demoUrl) && (
                  <div className="flex flex-wrap gap-3">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="h-btn h-btn-line h-swap-host">
                        <GithubLogo size={18} weight="duotone" className="s-icon" />
                        <span className="h-swap">
                          <span>GitHub</span>
                          <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">GitHub</span>
                        </span>
                        <ArrowUpRight size={14} weight="bold" />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="h-btn h-btn-line h-swap-host">
                        <span className="h-swap">
                          <span>Visit</span>
                          <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">Visit</span>
                        </span>
                        <ArrowUpRight size={14} weight="bold" />
                      </a>
                    )}
                  </div>
                )}
                {project.showGithubStats && (
                  <RepoStats stars={stars} downloads={stats?.total_downloads ?? null} clones={stats?.unique_cloners ?? null} />
                )}
              </div>
            )}

            {/* Facts */}
            <dl className="p-facts mt-7">
              {when && <div><dt>Date</dt><dd>{when}</dd></div>}
              {project.type && <div><dt>Type</dt><dd>{project.type}</dd></div>}
              {ai !== null && (
                <div>
                  <dt>AI usage</dt>
                  <dd className="flex flex-wrap items-center gap-2"><AITag value={ai} /> {aiLevel(ai).label}</dd>
                </div>
              )}
              {categories.length > 0 && (
                <div>
                  <dt>Category</dt>
                  <dd className="flex flex-wrap gap-1.5">{categories.map(c => <span key={c} className="h-pill h-pill-static">{c}</span>)}</dd>
                </div>
              )}
              {stack.length > 0 && (
                <div className="p-facts-wide">
                  <dt>Stack</dt>
                  <dd className="flex flex-wrap gap-1.5">{stack.map(t => <span key={t} className="h-pill h-pill-static">{t}</span>)}</dd>
                </div>
              )}
            </dl>

            {/* Write-up */}
            <article className="p-prose mt-12">
              {project.markdown
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.markdown}</ReactMarkdown>
                : <p>{project.description}</p>}
            </article>
          </div>
        </section>

        {/* Footer row: previous project, back to the grid, next project (also the arrow keys) */}
        <nav className="container mx-auto px-5 sm:px-8 mt-24 md:mt-28" aria-label="Projects">
          <div className="p-next">
            <div className="flex flex-wrap items-center gap-3">
              {prev && (
                <TransitionLink to={`/project/${prev.id}`} className="h-btn h-btn-line h-swap-host p-prev-link" transition={slashTo(prev, 'left')} aria-label={`Previous: ${withoutCompany(prev.title)}`}>
                  <ArrowLeft size={16} weight="bold" className="p-prev-arrow" />
                  <span className="h-swap">
                    <span>Previous</span>
                    <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">Previous</span>
                  </span>
                </TransitionLink>
              )}
              {back()}
            </div>
            {next && (
              <TransitionLink to={`/project/${next.id}`} className="h-btn h-btn-line h-swap-host p-next-link" transition={slashTo(next)}>
                <span className="h-caps text-[0.62rem] opacity-70">Next</span>
                <span className="h-swap p-next-title">
                  <span>{withoutCompany(next.title)}</span>
                  <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">{withoutCompany(next.title)}</span>
                </span>
                <ArrowRight size={16} weight="bold" className="p-next-arrow" />
              </TransitionLink>
            )}
          </div>
        </nav>
      </main>
    </SiteLayout>
  );
};

export default ProjectPage;
