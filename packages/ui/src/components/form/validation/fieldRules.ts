import { EMAIL_MAX_LENGTH, FIELD_LIMITS, PASSWORD_LIMITS } from '@kadai/shared';
import type { FieldRule } from './validateField';

interface TextRuleOptions {
  required?: boolean;
  max?: number;
}

/** The rules used across forms. They use the same limits as the API's field decorators. */
export const fieldRules = {
  text: (
    label: string,
    { required = false, max = FIELD_LIMITS.shortText }: TextRuleOptions = {},
  ): FieldRule<string> => ({
    label,
    required,
    maxLength: max,
  }),
  email: (label = 'Email'): FieldRule<string> => ({
    label,
    required: true,
    format: 'email',
    maxLength: EMAIL_MAX_LENGTH,
  }),
  phone: (label = 'Phone'): FieldRule<string> => ({ label, format: 'phone' }),
  /** A password being set. */
  newPassword: (label = 'Password'): FieldRule<string> => ({
    label,
    required: true,
    keepSpaces: true,
    minLength: PASSWORD_LIMITS.min,
    maxLength: PASSWORD_LIMITS.max,
  }),
  /** A password being checked, so older passwords still work if the length rules change. */
  currentPassword: (label = 'Password'): FieldRule<string> => ({
    label,
    required: true,
    keepSpaces: true,
    maxLength: PASSWORD_LIMITS.max,
  }),
};
