import { PASSWORD_LIMITS } from '@kadai/shared';

const LONG_PASSWORD = 12;
const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export interface PasswordStrength {
  /** 0 is too short and 4 is strong. */
  score: number;
  label: string;
}

/** A simple guide to help people choose better. It doesn't decide what the API accepts. */
export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_LIMITS.min) return { score: 0, label: LABELS[0] };

  const score =
    1 +
    Number(password.length >= LONG_PASSWORD) +
    Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) +
    Number(/[\d\W_]/.test(password));

  return { score, label: LABELS[score] };
}
