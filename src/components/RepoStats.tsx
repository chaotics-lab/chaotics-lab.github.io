import { useEffect, useState } from 'react';
import { CopySimple, DownloadSimple, Star, type Icon } from '@phosphor-icons/react';
import { prefersReducedMotion } from '@/lib/ticker';

// Counts up to `target` once it is known (ease-out, under a second).
function useCountUp(target: number | null) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null) return;
    if (prefersReducedMotion()) { setValue(target); return; }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

const Stat = ({ value, label, icon: Icon }: { value: number | null; label: string; icon: Icon }) => {
  const shown = useCountUp(value);
  if (value === null) return null;
  return (
    <div title={`${value.toLocaleString('en')} ${label.toLowerCase()}`}>
      <dt><Icon size={12} weight="bold" /> {label}</dt>
      <dd>{shown.toLocaleString('en')}</dd>
    </div>
  );
};

// GitHub numbers for a repo: big figures with a small label under each,
// split by thin rules.
export const RepoStats = ({ stars, downloads, clones }: { stars: number | null; downloads: number | null; clones: number | null }) => {
  if (stars === null && downloads === null && clones === null) return null;
  return (
    <dl className="repo-stats">
      <Stat value={stars} label="Stars" icon={Star} />
      <Stat value={downloads} label="Downloads" icon={DownloadSimple} />
      <Stat value={clones} label="Clones" icon={CopySimple} />
    </dl>
  );
};
