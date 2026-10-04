import { useEffect, useState } from 'react';

// Temporary (restyle branch): with #debug in the address, a panel to try
// other Google Fonts for the site's three font roles, live. Choices are
// remembered in this browser and only applied while #debug is there.
type Role = 'body' | 'display' | 'serif';
const ROLES: { role: Role; label: string; def: string; list: string[] }[] = [
  { role: 'body', label: 'Body (text, buttons)', def: 'Archivo', list: ['Archivo', 'Inter', 'Manrope', 'DM Sans', 'Space Grotesk', 'Outfit', 'Sora', 'Plus Jakarta Sans', 'Rubik', 'Work Sans', 'IBM Plex Sans', 'Barlow', 'Chivo', 'Figtree', 'Onest'] },
  { role: 'display', label: 'Display (big titles)', def: 'Archivo', list: ['Archivo', 'Anton', 'Bebas Neue', 'Oswald', 'Barlow Condensed', 'Saira Condensed', 'Big Shoulders Display', 'Archivo Narrow', 'Fjalla One', 'League Gothic', 'Antonio', 'Teko', 'Bricolage Grotesque', 'Unbounded', 'Syne'] },
  { role: 'serif', label: 'Serif (italic accents)', def: 'Instrument Serif', list: ['Instrument Serif', 'Playfair Display', 'DM Serif Display', 'Fraunces', 'Cormorant Garamond', 'Libre Caslon Text', 'Newsreader', 'Young Serif', 'Lora', 'EB Garamond', 'Spectral', 'Source Serif 4', 'Bodoni Moda', 'Gloock', 'Crimson Pro'] },
];
const KEY = 'lox-font-debug';
const loaded = new Set<string>();

function load(family: string) {
  if (loaded.has(family)) return;
  loaded.add(family);
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700;1,900&display=swap`;
  l.onerror = () => { l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}&display=swap`; };
  document.head.appendChild(l);
}
const apply = (role: Role, family: string) => { load(family); document.documentElement.style.setProperty(`--f-${role}`, `"${family}"`); };

export const FontDebug = () => {
  const [on, setOn] = useState(() => window.location.hash === '#debug');
  const [picked, setPicked] = useState<Record<Role, string>>(() => {
    try { return { body: 'Archivo', display: 'Archivo', serif: 'Instrument Serif', ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { body: 'Archivo', display: 'Archivo', serif: 'Instrument Serif' }; }
  });
  useEffect(() => {
    const f = () => setOn(window.location.hash === '#debug');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  // applied only while the panel is open, so the site goes back to its own fonts without #debug
  useEffect(() => {
    const roles = Object.keys(picked) as Role[];
    if (!on) { roles.forEach(r => document.documentElement.style.removeProperty(`--f-${r}`)); return; }
    roles.forEach(r => apply(r, picked[r]));
    try { localStorage.setItem(KEY, JSON.stringify(picked)); } catch { /* storage unavailable */ }
  }, [picked, on]);
  if (!on) return null;
  const set = (role: Role, family: string) => { if (family.trim()) setPicked(p => ({ ...p, [role]: family.trim() })); };
  return (
    <div className="fixed bottom-4 left-4 z-[200] w-80 rounded-2xl p-4 text-xs text-white bg-black/85 backdrop-blur" data-no-fx style={{ fontFamily: 'system-ui, sans-serif' }}>
      <p className="font-bold uppercase tracking-widest text-[0.6rem] mb-3">Fonts (debug)</p>
      {ROLES.map(({ role, label, list }) => (
        <div key={role} className="mb-3">
          <p className="mb-1 opacity-70">{label}</p>
          <select className="w-full rounded bg-white/10 px-2 py-1" value={list.includes(picked[role]) ? picked[role] : ''} onChange={e => set(role, e.target.value)}>
            {!list.includes(picked[role]) && <option value="">{picked[role]} (custom)</option>}
            {list.map(f => <option key={f} value={f} className="text-black">{f}</option>)}
          </select>
          <input className="mt-1 w-full rounded bg-white/10 px-2 py-1" placeholder="Any Google Fonts name, Enter" onKeyDown={e => { if (e.key === 'Enter') set(role, (e.target as HTMLInputElement).value); }} />
        </div>
      ))}
      <div className="flex justify-between">
        <button type="button" className="underline" onClick={() => setPicked({ body: 'Archivo', display: 'Archivo', serif: 'Instrument Serif' })}>Reset</button>
        <button type="button" className="underline" onClick={() => navigator.clipboard?.writeText(JSON.stringify(picked))}>Copy values</button>
      </div>
    </div>
  );
};
