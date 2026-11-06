import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Tooltip } from '../tooltip/Tooltip';
import { type FieldProps, FormField } from './FormField';
import { Input } from './Input';

interface PasswordFieldProps extends FieldProps<string> {
  autoComplete: 'current-password' | 'new-password';
}

/** Password input with a show or hide button, which helps people avoid typing mistakes. */
export function PasswordField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  autoComplete,
}: PasswordFieldProps) {
  const [isVisible, setVisible] = useState(false);
  const Icon = isVisible ? EyeSlashIcon : EyeIcon;
  const toggleLabel = isVisible ? 'Hide password' : 'Show password';

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      {(control) => (
        <div className="relative">
          <Input
            {...control}
            type={isVisible ? 'text' : 'password'}
            value={value}
            disabled={disabled}
            autoComplete={autoComplete}
            spellCheck={false}
            className="pr-10"
            onChange={(event) => onChange(event.target.value)}
          />
          <Tooltip label={toggleLabel}>
            <button
              type="button"
              aria-label={toggleLabel}
              onClick={() => setVisible(!isVisible)}
              className="absolute top-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-md text-muted hover:text-ink"
            >
              <Icon size={16} aria-hidden />
            </button>
          </Tooltip>
        </div>
      )}
    </FormField>
  );
}
