import { type FocusEvent, type ReactNode, useId } from 'react';
import { cn } from '../../cn';
import { FieldMessage } from './FieldMessage';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  /** Only for groups, which have no single input for a label to point at. */
  'aria-labelledby'?: string;
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
  /** For several inputs under one label, such as radio buttons. */
  group?: boolean;
  children: (control: FieldControlProps) => ReactNode;
}

/** Label, message and counter for any control. An error replaces the hint, so there is one message at a time. */
export function FormField({ label, error, hint, required, count, group, children }: FormFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);
  const Label = group ? 'span' : 'label';

  return (
    <div>
      <Label id={labelId} htmlFor={group ? undefined : id} className="mb-1 block font-medium">
        {label}
        {required ? (
          <span aria-hidden className="text-danger">
            {' '}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </Label>
      {children({
        id,
        'aria-labelledby': group ? labelId : undefined,
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
