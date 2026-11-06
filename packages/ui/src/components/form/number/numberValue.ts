interface SanitizeOptions {
  decimals: number;
  allowNegative: boolean;
}

/** Keeps only what can be part of a number, while still allowing half-typed values such as "12.". */
export function sanitizeNumber(raw: string, { decimals, allowNegative }: SanitizeOptions): string {
  const isNegative = allowNegative && raw.trim().startsWith('-');
  const [whole, ...rest] = raw.replace(/[^\d.]/g, '').split('.');
  const fraction = decimals > 0 && rest.length > 0 ? `.${rest.join('').slice(0, decimals)}` : '';
  return `${isNegative ? '-' : ''}${whole}${fraction}`;
}

interface StepOptions {
  step: number;
  min?: number;
  max?: number;
}

const decimalPlaces = (value: number) => String(value).split('.')[1]?.length ?? 0;

/** Moves by one step and stays in range. Rounds, so 0.1 + 0.2 gives 0.3 rather than 0.30000000000000004. */
export function stepNumber(value: string, direction: 1 | -1, { step, min, max }: StepOptions): string {
  const current = Number(value);
  const start = value === '' || Number.isNaN(current) ? (min ?? 0) : current;
  const next = value === '' ? start : start + direction * step;
  const rounded = Number(next.toFixed(Math.max(decimalPlaces(step), decimalPlaces(start))));
  return String(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded)));
}
