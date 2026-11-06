export const BUSINESS_TYPES = ['meat', 'crackers', 'dairy'] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
