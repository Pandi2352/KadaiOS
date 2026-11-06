import { scaleDecimal } from './decimal.js';

const rupeeFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

/** All money is stored and calculated as whole paise. */
export const toPaise = (rupees: string | number): number => scaleDecimal(rupees, 2);

export const fromPaise = (paise: number): number => paise / 100;

export const formatPaise = (paise: number): string => rupeeFormat.format(paise / 100);

function divideRounded(numerator: number, denominator: number): number {
  if (!Number.isSafeInteger(numerator)) {
    throw new RangeError('Amount is too large to calculate safely');
  }
  const magnitude = Math.floor((2 * Math.abs(numerator) + denominator) / (2 * denominator));
  return numerator < 0 && magnitude !== 0 ? -magnitude : magnitude;
}

/**
 * Line total for a price set per pricing unit. A price per kg and a quantity in grams
 * uses baseUnitsPerPricingUnit = 1000, so 240 rupees per kg for 1500 g is 360 rupees.
 */
export const lineTotalPaise = (unitPricePaise: number, baseQuantity: number, baseUnitsPerPricingUnit = 1): number =>
  divideRounded(unitPricePaise * baseQuantity, baseUnitsPerPricingUnit);

/** A percentage in basis points avoids decimals: 1250 means 12.5%. */
export const percentOfPaise = (paise: number, basisPoints: number): number => divideRounded(paise * basisPoints, 10000);
