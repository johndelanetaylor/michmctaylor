// Fixed tag vocabulary. Add here + nowhere else.
export const TAGS = {
  branding: 'Branding',
  packaging: 'Packaging',
  motion: 'Motion',
  content: 'Content Creation',
  merch: 'Merch',
  print: 'Print',
  digital: 'Digital',
} as const;

export type Tag = keyof typeof TAGS;
export const tagKeys = Object.keys(TAGS) as Tag[];
export const tagLabel = (t: Tag) => TAGS[t];
