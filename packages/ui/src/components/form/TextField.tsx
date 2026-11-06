import { XIcon } from '@phosphor-icons/react';
import { type InputHTMLAttributes, useRef } from 'react';
import { FieldAction } from './FieldAction';
import { type FieldProps, FormField } from './FormField';
import { Input, type InputExtras } from './Input';

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'onBlur' | 'disabled' | 'required'
>;

export type TextFieldProps = FieldProps<string> &
  NativeProps &
  InputExtras & {
    /** Shows an X to empty the field once it has a value. */
    clearable?: boolean;
    /** Shows "12/120" under the field. Needs maxLength. */
    showCount?: boolean;
  };

/** Label, message and a text input. EmailField, PhoneField and others are built on this. */
export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  clearable,
  showCount,
  endSlot,
  ...inputProps
}: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canClear = clearable && value !== '' && !disabled;
  const { maxLength } = inputProps;

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required={required}
      count={showCount && maxLength ? { length: value.length, max: maxLength } : undefined}
    >
      {(control) => (
        <Input
          {...control}
          {...inputProps}
          ref={inputRef}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          endSlot={
            canClear || endSlot ? (
              <>
                {canClear && <FieldAction icon={XIcon} label={`Clear ${label.toLowerCase()}`} onClick={clear} />}
                {endSlot}
              </>
            ) : undefined
          }
        />
      )}
    </FormField>
  );
}
