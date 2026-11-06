const DECIMAL_PATTERN = /^(-?)(\d+)(?:\.(\d+))?$/;

interface ScaleOptions {
  /** Throw when the value has more decimal places than the scale, instead of rounding. */
  exact?: boolean;
}

/**
 * Converts a decimal to a whole number of its smallest unit without floating point errors,
 * so scaleDecimal('1.15', 2) is exactly 115. Rounds half away from zero.
 */
export function scaleDecimal(value: string | number, digits: number, { exact = false }: ScaleOptions = {}): number {
  const match = DECIMAL_PATTERN.exec(String(value).trim());
  if (!match) {
    throw new RangeError(`"${value}" is not a valid number`);
  }

  const [, sign, whole, fraction = ''] = match;
  const kept = fraction.slice(0, digits).padEnd(digits, '0');
  const dropped = fraction.slice(digits);

  if (exact && /[1-9]/.test(dropped)) {
    throw new RangeError(`"${value}" has more than ${digits} decimal places`);
  }

  const rounded = Number(`${whole}${kept}`) + (dropped.charAt(0) >= '5' && dropped !== '' ? 1 : 0);
  if (!Number.isSafeInteger(rounded)) {
    throw new RangeError(`"${value}" is too large`);
  }
  return sign === '-' && rounded !== 0 ? -rounded : rounded;
}
