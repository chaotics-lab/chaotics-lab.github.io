import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight, ArrowUpRight, ArrowsOut, CaretLeft, CaretRight, GithubLogo, X } from '@phosphor-icons/react';
import { SiteLayout } from '@/components/site/SiteLayout';
import { TransitionLink } from '@/components/site/TransitionLink';
import { AITag } from '@/components/home/AITag';
import { RepoStats } from '@/components/RepoStats';
import { useGithubStars } from '@/hooks/useGithubStars';
import { useGithubStats } from '@/hooks/useGithubStats';
import { categoryLabel } from '@/config/categories';
import { aiLevel } from '@/config/aiLevels';
import { PROJECTS, withoutCompany } from '@/lib/projects';
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

const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const index = PROJECTS.findIndex(p => p.id === projectId);
  const project = index >= 0 ? PROJECTS[index] : undefined;
  const next = index >= 0 && PROJECTS.length > 1 ? PROJECTS[(index + 1) % PROJECTS.length] : undefined;
  const frames = useFrames(project?.imageUrl);
  const [current, setCurrent] = useState(0);
  const [viewer, setViewer] = useState(false);
  const stars = useGithubStars(project?.githubUrl, project?.showGithubStats);
  const stats = useGithubStats(project?.showGithubStats);
  const touchX = useRef<number | null>(null);
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
    setCurrent(0);
    setViewer(false);
  }, [projectId]);

  useEffect(() => {
    document.title = project ? `${withoutCompany(project.title)} | Lox` : 'Project not found | Lox';
  }, [project]);

  const last = frames.length - 1;
  const go = (d: number) => setCurrent(c => Math.min(last, Math.max(0, c + d)));

  // Full-screen viewer: arrows to browse, Escape to close.
  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewer(false);
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(last, c + 1));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [viewer, last]);

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

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  return (
    <SiteLayout>
      <main className="relative pt-28 md:pt-36">
        <div
          className="absolute -top-[20vh] -right-[20vw] w-[80vw] h-[70vh] pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgb(var(--h-c2-rgb) / 0.28), transparent)' }}
          aria-hidden="true"
        />

        {/* Title block */}
        <section className="relative container mx-auto px-5 sm:px-8">
          <TransitionLink to="/#projects" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--h-c2)] hover:text-white transition-colors h-swap-host">
            <ArrowLeft size={16} weight="bold" />
            <span className="h-swap">
              <span>All projects</span>
              <span className="h-serif text-[1.05rem] leading-[1.05]" aria-hidden="true">All projects</span>
            </span>
          </TransitionLink>

          <div className="mt-10">
            <p className="h-caps text-[0.68rem] text-[var(--h-c2)]">{[categories.join(' / '), when].filter(Boolean).join(' · ')}</p>
            {/* Logo sits left of the title, as tall as the title */}
            <div className="mt-4 flex items-center gap-4 md:gap-7">
              {project.logoUrl && <img src={project.logoUrl} alt="" className="p-logo" style={titleH ? { height: titleH } : undefined} />}
              <h1 ref={titleRef} className="h-display text-[clamp(3rem,8vw,7rem)] break-words min-w-0">
                <span className="h-line"><span>{withoutCompany(project.title)}</span></span>
              </h1>
            </div>
            <p className="mt-6 max-w-3xl text-lg md:text-xl leading-relaxed text-[var(--h-c3)]">{project.description}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-6">
            {(project.githubUrl || project.demoUrl) && (
              <div className="flex flex-wrap gap-3">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="h-btn h-btn-cream">
                    <GithubLogo size={18} weight="duotone" className="s-icon" /> GitHub <ArrowUpRight size={14} weight="bold" />
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="h-btn h-btn-line">
                    Visit <ArrowUpRight size={14} weight="bold" />
                  </a>
                )}
              </div>
            )}
            {project.showGithubStats && (
              <RepoStats stars={stars} downloads={stats?.total_downloads ?? null} clones={stats?.unique_cloners ?? null} />
            )}
          </div>
        </section>

        {/* Facts */}
        <section className="container mx-auto px-5 sm:px-8 mt-12">
          <dl className="p-facts">
            {when && <div><dt>Date</dt><dd>{when}</dd></div>}
            {project.type && <div><dt>Type</dt><dd>{project.type}</dd></div>}
            {categories.length > 0 && <div><dt>Category</dt><dd>{categories.join(', ')}</dd></div>}
            {ai !== null && (
              <div>
                <dt>AI usage</dt>
                <dd className="flex flex-wrap items-center gap-2"><AITag value={ai} /> {aiLevel(ai).label}</dd>
              </div>
            )}
            {stack.length > 0 && (
              <div className="p-facts-wide">
                <dt>Stack</dt>
                <dd className="flex flex-wrap gap-1.5">{stack.map(t => <span key={t} className="p-chip">{t}</span>)}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Write-up beside the images; images first on phones */}
        <section className="container mx-auto px-5 sm:px-8 mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-16">
          {frames.length > 0 && (
            <div className="lg:order-2 lg:sticky lg:top-24 self-start min-w-0" aria-label="Images">
              <div className="p-stage" {...swipe}>
                {frames.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${withoutCompany(project.title)}, image ${i + 1}`}
                    data-on={i === current}
                    onClick={() => setViewer(true)}
                  />
                ))}
                <button type="button" className="s-circle absolute right-3 bottom-3" onClick={() => setViewer(true)} aria-label="View full screen">
                  <ArrowsOut size={18} weight="bold" />
                </button>
              </div>
              {frames.length > 1 && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="p-thumbs">
                    {frames.map((src, i) => (
                      <button key={src} type="button" className="p-thumb" aria-current={i === current} onClick={() => setCurrent(i)} aria-label={`Image ${i + 1}`}>
                        <img src={src} alt="" />
                      </button>
                    ))}
                  </div>
                  <button type="button" className="s-circle shrink-0" onClick={() => go(-1)} disabled={current === 0} aria-label="Previous image">
                    <CaretLeft size={18} weight="bold" />
                  </button>
                  <button type="button" className="s-circle shrink-0" onClick={() => go(1)} disabled={current === last} aria-label="Next image">
                    <CaretRight size={18} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          )}
          <article className="p-prose min-w-0 lg:order-1">
            {project.markdown
              ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.markdown}</ReactMarkdown>
              : <p>{project.description}</p>}
          </article>
        </section>

        {next && (
          <section className="container mx-auto px-5 sm:px-8 mt-28">
            <TransitionLink to={`/project/${next.id}`} className="p-next">
              <span className="h-caps text-[0.68rem] text-[var(--h-c2)]">Next project</span>
              <span className="mt-3 flex items-end justify-between gap-6">
                <span className="h-display text-[clamp(2.6rem,7vw,6rem)] p-next-title">{withoutCompany(next.title)}</span>
                <ArrowRight className="p-next-arrow" weight="bold" />
              </span>
            </TransitionLink>
          </section>
        )}
      </main>

      {viewer && frames[current] && (
        <div className="p-viewer" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setViewer(false)} {...swipe}>
          <img src={frames[current]} alt={`${withoutCompany(project.title)}, image ${current + 1}`} onClick={e => e.stopPropagation()} />
          <button type="button" className="s-circle absolute top-4 right-4" onClick={() => setViewer(false)} aria-label="Close">
            <X size={20} weight="bold" />
          </button>
          {frames.length > 1 && (
            <>
              <button type="button" className="s-circle absolute left-4 top-1/2 -translate-y-1/2" onClick={e => { e.stopPropagation(); go(-1); }} disabled={current === 0} aria-label="Previous image">
                <CaretLeft size={20} weight="bold" />
              </button>
              <button type="button" className="s-circle absolute right-4 top-1/2 -translate-y-1/2" onClick={e => { e.stopPropagation(); go(1); }} disabled={current === last} aria-label="Next image">
                <CaretRight size={20} weight="bold" />
              </button>
            </>
          )}
        </div>
      )}
    </SiteLayout>
  );
};

export default ProjectPage;
