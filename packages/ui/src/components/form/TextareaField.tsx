import type { TextareaHTMLAttributes } from 'react';
import { type FieldProps, FormField } from './FormField';
import { Textarea } from './Textarea';

type NativeProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'onBlur' | 'disabled' | 'required'
>;

interface TextareaFieldProps extends FieldProps<string>, NativeProps {
  /** Shows "12/500" under the field. Needs maxLength. */
  showCount?: boolean;
}

export function TextareaField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  showCount,
  ...textareaProps
}: TextareaFieldProps) {
  const { maxLength } = textareaProps;

  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required={required}
      count={showCount && maxLength ? { length: value.length, max: maxLength } : undefined}
    >
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
