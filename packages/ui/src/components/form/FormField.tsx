import { type FocusEvent, type ReactNode, useId } from 'react';
import { cn } from '../../cn';
import { FieldMessage } from './FieldMessage';

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
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
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
  /** Shows "12/120" under the field. */
  count?: { length: number; max: number };
  children: (control: FieldControlProps) => ReactNode;
}

/** Label, message and counter for any control. An error replaces the hint, so there is one message at a time. */
export function FormField({ label, error, hint, required, count, children }: FormFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium">
        {label}
        {required ? (
          <span aria-hidden className="text-danger">
            {' '}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': hasMessage ? messageId : undefined,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {(hasMessage || count) && (
        <div className="mt-1 flex items-start justify-between gap-3">
          {hasMessage && (
            <FieldMessage id={messageId} tone={error ? 'error' : 'hint'}>
              {error ?? hint}
            </FieldMessage>
          )}
          {count && (
            <span
              className={cn('ml-auto shrink-0 tabular-nums', count.length > count.max ? 'text-danger' : 'text-muted')}
            >
              {count.length}/{count.max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
