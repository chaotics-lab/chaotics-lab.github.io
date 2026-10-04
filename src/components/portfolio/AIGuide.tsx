import { useEffect, useRef, useState } from 'react';
import { AI_LEVELS, AI_RAMP } from '@/config/aiLevels';
import { AITag } from '@/components/home/AITag';

// The AI tag of a project page, opening the usage guide: every level with
// its bars, name and what it means, this project's one highlighted. Opens
// on hover (mouse) or click / tap; closes when the mouse leaves, on Escape
// or a click outside. Persona-style: the panel unfolds with a slanted wipe,
// the levels cascade in sliding and un-skewing, and a plain highlight
// sweeps in behind this project's level last; closing carries the wipe on to the right.
const CLOSE_MS = 240;
export const AIGuide = ({ value }: { value: number }) => {
  const [open, setOpenRaw] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(0);
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => {
    const v = typeof next === 'function' ? next(open && !leaving) : next;
    clearTimeout(timer.current);
    if (v) { setLeaving(false); setOpenRaw(true); return; }
    if (!open) return;
    setLeaving(true);
    timer.current = window.setTimeout(() => { setOpenRaw(false); setLeaving(false); }, CLOSE_MS);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const ref = useRef<HTMLSpanElement>(null);
  const current = Math.max(0, Math.min(5, Math.round(value / 20)));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('pointerdown', onDown); window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <span
      ref={ref}
      className="ai-guide"
      onPointerEnter={e => { if (e.pointerType === 'mouse') setOpen(true); }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') setOpen(false); }}
    >
      <button type="button" className="ai-guide-btn" onClick={() => setOpen(o => !o)} aria-expanded={open && !leaving} aria-label="AI usage guide">
        <AITag value={value} />
      </button>
      {open && (
        <span className="ai-guide-panel" role="dialog" aria-label="AI usage guide" data-leaving={leaving || undefined}>
          <span className="h-caps text-[0.6rem] text-[var(--h-c2)]">How much AI went into it</span>
          {AI_LEVELS.map((l, i) => (
            <span key={l.value} className="ai-guide-row" data-current={i === current || undefined} style={{ ['--i' as string]: i }}>
              <span className="ai-tag-bars" aria-hidden="true">
                {AI_RAMP.map((color, k) => <i key={k} style={k < i ? { background: color } : undefined} />)}
              </span>
              <span>
                <span className="ai-guide-name">{l.label}</span>
                <span className="ai-guide-desc">{l.description}</span>
              </span>
            </span>
          ))}
        </span>
      )}
    </span>
  );
};
