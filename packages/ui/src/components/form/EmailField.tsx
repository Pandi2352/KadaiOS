import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { EMAIL_MAX_LENGTH } from '@kadai/shared';
import { TextField, type TextFieldProps } from './TextField';

/** A text field set up for email: the right keyboard, autofill and no auto-capitals. */
export function EmailField({ label = 'Email', ...props }: Omit<TextFieldProps, 'label'> & { label?: string }) {
  return (
    <TextField
      type="email"
      inputMode="email"
      autoComplete="username"
      autoCapitalize="none"
      spellCheck={false}
      maxLength={EMAIL_MAX_LENGTH}
      placeholder="name@example.com"
      startIcon={EnvelopeSimpleIcon}
      label={label}
      {...props}
    />
  );
}
