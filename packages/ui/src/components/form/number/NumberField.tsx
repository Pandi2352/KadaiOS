import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import type { KeyboardEvent } from 'react';
import { FieldAction } from '../FieldAction';
import { TextField, type TextFieldProps } from '../TextField';
import { sanitizeNumber, stepNumber } from './numberValue';

type NumberFieldProps = Omit<TextFieldProps, 'type' | 'inputMode' | 'min' | 'max' | 'step'> & {
  min?: number;
  max?: number;
  step?: number;
  /** How many digits after the point. Use 0 for whole numbers, 2 for money, 3 for kg. */
  decimals?: number;
  /** Shows minus and plus buttons, for quantities. The arrow keys always work. */
  steppers?: boolean;
};

/**
 * For prices, weights and quantities. The value stays text, so "12." can be typed and nothing
 * loses accuracy. Use startText="₹" or endText="kg" for units.
 */
export function NumberField({ min, max, step = 1, decimals = 2, steppers, onKeyDown, ...props }: NumberFieldProps) {
  const { value, onChange, disabled } = props;
  const stepBy = (direction: 1 | -1) => onChange(stepNumber(value, direction, { step, min, max }));
  const current = Number(value);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    stepBy(event.key === 'ArrowUp' ? 1 : -1);
  };

  return (
    <TextField
      {...props}
      type="text"
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      autoComplete="off"
      className="tabular-nums"
      onChange={(next) => onChange(sanitizeNumber(next, { decimals, allowNegative: (min ?? 0) < 0 }))}
      onKeyDown={handleKeyDown}
      endSlot={
        steppers ? (
          <>
            <FieldAction
              icon={MinusIcon}
              label="Decrease"
              disabled={disabled || (min !== undefined && value !== '' && current <= min)}
              onClick={() => stepBy(-1)}
            />
            <FieldAction
              icon={PlusIcon}
              label="Increase"
              disabled={disabled || (max !== undefined && value !== '' && current >= max)}
              onClick={() => stepBy(1)}
            />
          </>
        ) : undefined
      }
    />
  );
}
