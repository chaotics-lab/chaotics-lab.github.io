import { useEffect, useState } from 'react';
import { CAUSTIC_TUNE, retuneCaustics } from '@/lib/oceanFx';

// Temporary: sliders for the Aqua seabed caustics, shown with #debug in the
// address. To be removed once the values are settled.
const SLIDERS: [keyof typeof CAUSTIC_TUNE, string, number, number, number][] = [
  ['lo', 'Cutout start', 0, 0.9, 0.01],
  ['hi', 'Cutout full', 0.1, 1, 0.01],
  ['alpha', 'Layer strength', 0.2, 2, 0.05],
  ['scale', 'Scale', 0.4, 3, 0.05],
  ['flat', 'Flatness', 0.3, 2, 0.05],
  ['speed', 'Speed', 0, 4, 0.1],
  ['warp', 'Warp strength', 0, 80, 1],
  ['warpSize', 'Warp size', 40, 800, 10],
  ['warpSpeed', 'Warp speed', 0, 5, 0.1],
];

export const CausticDebug = () => {
  const [on, setOn] = useState(() => window.location.hash === '#debug');
  const [, bump] = useState(0);
  useEffect(() => {
    const f = () => setOn(window.location.hash === '#debug');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  if (!on) return null;
  const set = (k: keyof typeof CAUSTIC_TUNE, v: number) => { CAUSTIC_TUNE[k] = v; retuneCaustics(); bump(n => n + 1); };
  return (
    <div className="fixed bottom-4 left-4 z-[200] w-72 rounded-2xl p-4 text-xs text-white bg-black/80 backdrop-blur" data-no-fx>
      <p className="h-caps text-[0.6rem] mb-3">Caustics (Aqua seabed)</p>
      {SLIDERS.map(([k, label, min, max, step]) => (
        <label key={k} className="block mb-2">
          <span className="flex justify-between"><span>{label}</span><span>{CAUSTIC_TUNE[k].toFixed(2)}</span></span>
          <input type="range" min={min} max={max} step={step} value={CAUSTIC_TUNE[k]} onChange={e => set(k, Number(e.target.value))} className="w-full" />
        </label>
      ))}
      <button type="button" className="mt-1 underline" onClick={() => navigator.clipboard?.writeText(JSON.stringify(CAUSTIC_TUNE))}>Copy values</button>
    </div>
  );
};
