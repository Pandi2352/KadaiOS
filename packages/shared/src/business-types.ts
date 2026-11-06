export const BUSINESS_TYPES = ['meat', 'crackers', 'dairy'] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const isBusinessType = (value: unknown): value is BusinessType =>
  typeof value === 'string' && (BUSINESS_TYPES as readonly string[]).includes(value);
