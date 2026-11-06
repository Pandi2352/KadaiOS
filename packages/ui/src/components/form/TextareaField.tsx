import type { TextareaHTMLAttributes } from 'react';
import { type FieldProps, FormField } from './FormField';
import { Textarea } from './Textarea';

type NativeProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'disabled' | 'required'>;

export function TextareaField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  ...textareaProps
}: FieldProps<string> & NativeProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      {(control) => (
        <Textarea
          {...control}
          {...textareaProps}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FormField>
  );
}
