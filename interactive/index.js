// Add a new folder with index.html, styles.css, and script.js, then list it here.
export const reports = [
  {
    number: '01',
    category: 'ANIMAL RESCUE',
    title: 'Where did 122M VND in foster aid go?',
    description: 'Trace 122.58M VND across 3 time epochs from 22 benefactors through bulk nutrition orders to 42 foster shelters across Saigon.',
    href: './interactive/donation-epochs/',
    cover: {
      src: './interactive/donation-epochs/cover.svg',
      alt: 'Diagram of donations branching from a central fund toward foster care',
    },
    featured: true,
  },
  {
    number: '02',
    category: 'ANIMAL RESCUE',
    title: 'Playing back 22 foster cycles',
    description: 'An animated month-by-month timeline stepping through 122.58M VND in aid from 2024 to 2026.',
    href: './interactive/donation-timeline/',
  },
];

export const futureSlots = [
  { number: '03', title: 'Next investigation', description: 'More to explore as this collection grows.' },
];
