/**
 * Design Tokens for TenderAI Responsive UI
 */

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  LAPTOP: 1440,
  DESKTOP: 1920,
  WIDE_DESKTOP: 2560,
};

export const SPACING = {
  container: 'clamp(1rem, 3vw, 2.5rem)',
  card: '1.25rem',
  gap: '1rem',
};

export const Z_INDEX = {
  base: 0,
  header: 10,
  sidebar: 20,
  dropdown: 30,
  drawer: 40,
  modal: 50,
  toast: 60,
};

export const TYPOGRAPHY = {
  display: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  h2: 'text-xl md:text-2xl font-semibold',
  body: 'text-base leading-relaxed',
  metric: 'text-2xl md:text-3xl font-mono font-bold',
};
