import { type ReactNode, useId } from 'react';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

/** The props every *Field component accepts, however its value is entered. */
export interface FieldProps<V> {
  label: string;
  value: V;
  onChange: (value: V) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (control: FieldControlProps) => ReactNode;
}

/** Label, hint and error for any control, with the accessibility links between them. */
export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="mt-1 text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
