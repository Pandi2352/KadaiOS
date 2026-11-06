import type { InputHTMLAttributes } from 'react';
import { type FieldProps, FormField } from './FormField';
import { Input } from './Input';

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'disabled' | 'required'>;

/** Label, hint, error and a text input. Use `type` and `inputMode` for phone, number and similar. */
export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  ...inputProps
}: FieldProps<string> & NativeProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      {(control) => (
        <Input
          {...control}
          {...inputProps}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FormField>
  );
}
