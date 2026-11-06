import { PhoneIcon } from '@phosphor-icons/react';
import { TextField, type TextFieldProps } from './TextField';

/** A text field set up for phone numbers, with the same format help everywhere. */
export function PhoneField({ label = 'Phone', ...props }: Omit<TextFieldProps, 'label'> & { label?: string }) {
  return (
    <TextField
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+91 98765 43210"
      hint="10 to 15 digits. A + at the start is fine."
      startIcon={PhoneIcon}
      label={label}
      {...props}
    />
  );
}
