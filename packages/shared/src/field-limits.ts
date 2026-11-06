export const FIELD_LIMITS = {
  shortText: 120,
  longText: 500,
} as const;

/** After normalizePhone: an optional + and 10 to 15 digits, which covers mobiles and landlines with area codes. */
export const PHONE_PATTERN = /^\+?\d{10,15}$/;

export const normalizePhone = (value: string): string => value.replace(/[\s()-]/g, '');
