export const SITE = {
  name: 'Michelle M. Taylor',
  short: 'mmt',
  tagline: 'graphic designer specializing in print and digital design',
  description:
    'Michelle M. Taylor is a graphic designer with 10+ years of experience in print and digital design, specializing in branding, packaging, and motion for CPG brands.',
  email: 'michmctaylor@gmail.com',
  social: {
    instagram: 'https://www.instagram.com/michmctaylor.ai',
    linkedin: 'https://www.linkedin.com/in/michelle-taylor-191b70100/',
    dribbble: 'https://dribbble.com/michmctaylor',
  },
  nav: [
    { href: '/work', label: 'Work' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
};

// Prefix a site-absolute path with Astro's `base` (set only for the temporary
// github.io/<repo> preview; '/' once the custom domain is live).
export const url = (path: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
};
