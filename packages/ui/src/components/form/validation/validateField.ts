import { normalizePhone, PHONE_PATTERN } from '@kadai/shared';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FieldRule<V = unknown, T = unknown> {
  /** Used in messages, such as "Shop name is required". */
  label: string;
  required?: boolean;
  format?: 'email' | 'phone' | 'number';
  minLength?: number;
  maxLength?: number;
  /** For numbers. */
  min?: number;
  max?: number;
  /** Spaces count as part of the value. Only passwords need this. */
  keepSpaces?: boolean;
  /** Any other check, such as two passwords matching. It only runs when the field has a value. */
  validate?: (value: V, values: T) => string | undefined;
}

export type FormRules<T> = { [K in keyof T]?: FieldRule<T[K], T> };

const FORMAT_CHECKS = {
  email: { isValid: (text: string) => EMAIL_PATTERN.test(text), message: 'must be a valid email address' },
  phone: { isValid: (text: string) => PHONE_PATTERN.test(normalizePhone(text)), message: 'must have 10 to 15 digits' },
  number: { isValid: (text: string) => !Number.isNaN(Number(text)), message: 'must be a number' },
};

const checkText = <V, T>(rule: FieldRule<V, T>, text: string): string | undefined => {
  const { label, format, minLength, maxLength, min, max } = rule;

  if (format && !FORMAT_CHECKS[format].isValid(text)) return `${label} ${FORMAT_CHECKS[format].message}`;
  if (minLength !== undefined && text.length < minLength) return `${label} must have at least ${minLength} characters`;
  if (maxLength !== undefined && text.length > maxLength) return `${label} must be ${maxLength} characters or fewer`;
  if (min !== undefined && Number(text) < min) return `${label} must be at least ${min}`;
  if (max !== undefined && Number(text) > max) return `${label} must be ${max} or less`;
  return undefined;
};

/** Returns the first problem with a value. The messages match the API's, and the API still checks everything. */
export function validateField<V, T>(rule: FieldRule<V, T>, value: V, values: T): string | undefined {
  const text = typeof value === 'string' && !rule.keepSpaces ? value.trim() : value;

  const isEmpty = Array.isArray(text) ? text.length === 0 : text === '' || text === false || text == null;
  if (isEmpty) {
    return rule.required ? `${rule.label} is required` : undefined;
  }

  return (typeof text === 'string' ? checkText(rule, text) : undefined) ?? rule.validate?.(value, values);
}
