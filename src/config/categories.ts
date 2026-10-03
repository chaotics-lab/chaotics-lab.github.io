// Project categories, in menu order. Descriptions are shown under the
// home menu and the project filters.
export interface CategoryInfo {
  id: string;
  label: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'all',
    label: 'All Projects',
    description: 'Everything. Some of them shipped, some burnt (literally, a certain drone caught on fire..)',
  },
  {
    id: 'systems',
    label: 'Embedded Systems',
    description: 'Low-level projects that interact with the physical world end up here.',
  },
  {
    id: 'ai',
    label: 'AI & ML',
    description: 'The full spectrum of what AI means: from using pre-trained AI models to implementing SOTA research papers to making literal neurons out of resistors and capacitors.',
  },
  {
    id: 'apps',
    label: 'Applications & Tools',
    description: 'Web/Desktop fullstack applications and self-hosted tools built to solve problems.',
  },
  {
    id: 'games',
    label: 'Games',
    description: 'Games, game dev tools and gaming related projects, as I have a soft spot for video games :)',
  },
];

export const categoryLabel = (id?: string) => CATEGORIES.find(c => c.id === id)?.label ?? id ?? '';
