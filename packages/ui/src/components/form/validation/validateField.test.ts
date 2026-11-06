import { describe, expect, it } from 'vitest';
import { fieldRules } from './fieldRules';
import { type FieldRule, validateField } from './validateField';

const check = <V>(rule: FieldRule<V>, value: V) => validateField(rule, value, {});

describe('validateField', () => {
  it.each([
    ['', 'Name is required'],
    ['   ', 'Name is required'],
    ['x'.repeat(121), 'Name must be 120 characters or fewer'],
    ['Kavi', undefined],
    ['  Kavi  ', undefined],
  ])('checks required text: %j', (value, message) => {
    expect(check(fieldRules.text('Name', { required: true }), value)).toBe(message);
  });

  it('lets an optional field stay empty', () => {
    expect(check(fieldRules.phone(), '')).toBeUndefined();
    expect(check(fieldRules.phone(), '   ')).toBeUndefined();
  });

  it.each([
    ['', 'Email is required'],
    ['not-an-email', 'Email must be a valid email address'],
    ['a@b', 'Email must be a valid email address'],
    [' name@example.com ', undefined],
  ])('checks email: %j', (value, message) => {
    expect(check(fieldRules.email(), value)).toBe(message);
  });

  it.each([
    ['not a phone', 'Phone must have 10 to 15 digits'],
    ['12345', 'Phone must have 10 to 15 digits'],
    ['+91 90000-11111', undefined],
    ['(044) 2345 6789', undefined],
  ])('checks phone: %j', (value, message) => {
    expect(check(fieldRules.phone(), value)).toBe(message);
  });

  it('keeps spaces in passwords', () => {
    expect(check(fieldRules.currentPassword(), '   ')).toBeUndefined();
    expect(check(fieldRules.newPassword(), 'short')).toBe('Password must have at least 8 characters');
    expect(check(fieldRules.newPassword(), 'x'.repeat(129))).toBe('Password must be 128 characters or fewer');
  });

  it('checks numbers', () => {
    const rule = { label: 'Price', format: 'number' as const, min: 1, max: 10 };
    expect(check(rule, 'abc')).toBe('Price must be a number');
    expect(check(rule, '0')).toBe('Price must be at least 1');
    expect(check(rule, '11')).toBe('Price must be 10 or less');
    expect(check(rule, '5')).toBeUndefined();
  });

  it('treats an unticked required checkbox as missing', () => {
    expect(check({ label: 'Terms', required: true }, false)).toBe('Terms is required');
    expect(check({ label: 'Terms', required: true }, true)).toBeUndefined();
  });

  it('runs a custom check against the other values, only once there is a value', () => {
    const rule = {
      label: 'Confirm',
      validate: (value: string, values: { password: string }) =>
        value === values.password ? undefined : 'Passwords must match',
    };
    expect(validateField(rule, 'a', { password: 'b' })).toBe('Passwords must match');
    expect(validateField(rule, 'b', { password: 'b' })).toBeUndefined();
    expect(validateField(rule, '', { password: 'b' })).toBeUndefined();
  });
});
