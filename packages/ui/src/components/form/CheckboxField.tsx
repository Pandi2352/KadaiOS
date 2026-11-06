import { useId } from 'react';
import { FieldMessage } from './FieldMessage';
import type { FieldProps } from './FormField';

/** A checkbox reads as a statement, so its label sits beside it and it's never marked optional. */
export function CheckboxField({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  disabled,
}: FieldProps<boolean>) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div>
      <div className="flex items-start gap-2">
        <input
          id={id}
          type="checkbox"
          checked={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-required={required ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          onChange={(event) => onChange(event.target.checked)}
          onBlur={onBlur}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded-md accent-brand focus-visible:outline-offset-1 disabled:cursor-not-allowed"
        />
        <label htmlFor={id} className="cursor-pointer">
          {label}
          {required && (
            <span aria-hidden className="text-danger">
              {' '}
              *
            </span>
          )}
        </label>
      </div>
      {message && (
        <FieldMessage id={messageId} tone={error ? 'error' : 'hint'} className="mt-1 ml-6">
          {message}
        </FieldMessage>
      )}
    </div>
  );
}
