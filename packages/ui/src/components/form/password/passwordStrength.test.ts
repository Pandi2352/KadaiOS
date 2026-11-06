import { describe, expect, it } from 'vitest';
import { getPasswordStrength } from './passwordStrength';

describe('getPasswordStrength', () => {
  it.each([
    ['short', 0, 'Too short'],
    ['lowercase', 1, 'Weak'],
    ['lowercase1', 2, 'Fair'],
    ['Lowercase1', 3, 'Good'],
    ['Lowercase1-long', 4, 'Strong'],
  ])('rates %j as %i', (password, score, label) => {
    expect(getPasswordStrength(password)).toEqual({ score, label });
  });
});
