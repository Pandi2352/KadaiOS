import type { Icon } from '@phosphor-icons/react';
import { useId } from 'react';
import { cn } from '../../cn';
import { type FieldProps, FormField } from './FormField';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: Icon;
  disabled?: boolean;
}

interface RadioGroupFieldProps<T extends string> extends FieldProps<T | ''> {
  options: RadioOption<T>[];
  /** Two columns from tablet width upward. Phones always get one. */
  columns?: 1 | 2;
}

/** For a few choices that should all be visible. Use SelectField for longer lists. Arrow keys move between options. */
export function RadioGroupField<T extends string>({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  disabled,
  options,
  columns = 1,
}: RadioGroupFieldProps<T>) {
  const name = useId();

  return (
    <FormField label={label} error={error} hint={hint} required={required} group>
      {(control) => (
        <div
          {...control}
          role="radiogroup"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.(event);
          }}
          className={cn('grid gap-2', columns === 2 && 'sm:grid-cols-2')}
        >
          {options.map((option) => {
            const OptionIcon = option.icon;
            return (
              <label
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-start gap-2 rounded-md border bg-surface p-3 transition-colors hover:bg-hover',
                  'has-checked:border-brand has-checked:bg-brand-soft',
                  'has-disabled:cursor-not-allowed has-disabled:bg-hover has-disabled:text-muted',
                  error ? 'border-danger' : 'border-field',
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={disabled || option.disabled}
                  onChange={() => onChange(option.value)}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand focus-visible:outline-offset-1 disabled:cursor-not-allowed"
                />
                {OptionIcon && <OptionIcon size={20} aria-hidden className="shrink-0 text-brand" />}
                <span className="min-w-0">
                  <span className="block font-medium">{option.label}</span>
                  {option.description && <span className="block text-muted">{option.description}</span>}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </FormField>
  );
}
