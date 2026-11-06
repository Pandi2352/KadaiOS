import { EyeIcon, EyeSlashIcon, LockKeyIcon } from '@phosphor-icons/react';
import { type FocusEvent, type KeyboardEvent, useState } from 'react';
import { FieldAction } from './FieldAction';
import { FieldMessage } from './FieldMessage';
import { type FieldProps, FormField } from './FormField';
import { Input } from './Input';
import { PasswordStrengthMeter } from './password/PasswordStrengthMeter';

interface PasswordFieldProps extends FieldProps<string> {
  autoComplete: 'current-password' | 'new-password';
  placeholder?: string;
  /** Shows how strong the password is. Use it when a password is being chosen. */
  showStrength?: boolean;
}

/** Password input with show or hide, a Caps Lock warning, and an optional strength meter. */
export function PasswordField({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  disabled,
  autoComplete,
  placeholder,
  showStrength,
}: PasswordFieldProps) {
  const [isVisible, setVisible] = useState(false);
  const [isCapsLockOn, setCapsLockOn] = useState(false);

  const checkCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(event.getModifierState('CapsLock'));
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setCapsLockOn(false);
    onBlur?.(event);
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      {(control) => (
        <>
          <Input
            {...control}
            type={isVisible ? 'text' : 'password'}
            value={value}
            disabled={disabled}
            autoComplete={autoComplete}
            autoCapitalize="none"
            spellCheck={false}
            placeholder={placeholder}
            startIcon={LockKeyIcon}
            onChange={(event) => onChange(event.target.value)}
            onBlur={handleBlur}
            onKeyDown={checkCapsLock}
            onKeyUp={checkCapsLock}
            endSlot={
              <FieldAction
                icon={isVisible ? EyeSlashIcon : EyeIcon}
                label={isVisible ? 'Hide password' : 'Show password'}
                disabled={disabled}
                onClick={() => setVisible(!isVisible)}
              />
            }
          />
          {showStrength && <PasswordStrengthMeter password={value} />}
          {isCapsLockOn && (
            <FieldMessage tone="warning" className="mt-1">
              Caps Lock is on
            </FieldMessage>
          )}
        </>
      )}
    </FormField>
  );
}
