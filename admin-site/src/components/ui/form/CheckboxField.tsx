import { useId } from 'react';
import type { FieldProps } from './FormField';

/** A checkbox reads as a statement, so its label sits beside it and it's never marked optional. */
export function CheckboxField({
  label,
  value,
  onChange,
  error,
  hint,
  disabled,
}: Omit<FieldProps<boolean>, 'required'>) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="flex items-start gap-2">
        <input
          id={id}
          type="checkbox"
          checked={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded-md accent-brand disabled:cursor-not-allowed"
        />
        <label htmlFor={id} className="cursor-pointer">
          {label}
        </label>
      </div>
      {hint && (
        <p id={hintId} className="mt-1 ml-6 text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 ml-6 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
