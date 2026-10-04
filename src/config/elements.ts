// The seven decorative elements, always in this order. Icons live in
// /public as <id>.png.
// `on` is the text colour that reads on top of the element colour.

export interface ElementInfo {
  id: string;
  name: string;
  color: string;
  on: string;
}

const CREAM = '#F5E8D6';
const INK = '#121212';

export const ELEMENTS: ElementInfo[] = [
  { id: 'aqua',  name: 'Aqua',  color: '#0053B4', on: CREAM },
  { id: 'pyra',  name: 'Pyra',  color: '#C9120D', on: CREAM }, // the icon's red moved to hue 29 (themes.ts)
  { id: 'cryo',  name: 'Cryo',  color: '#00CFE4', on: INK },
  { id: 'volta', name: 'Volta', color: '#B7DD00', on: INK },
  { id: 'aero',  name: 'Aero',  color: '#8EACA2', on: INK },
  { id: 'gaia',  name: 'Gaia',  color: '#B27150', on: INK },
  { id: 'flora', name: 'Flora', color: '#D858C2', on: INK },
];
