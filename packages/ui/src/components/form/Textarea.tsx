import type { TextareaHTMLAttributes } from 'react';
import { fieldClass } from './fieldStyles';

/** Grows with its text up to a limit, then scrolls. It can also be resized by hand. */
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={fieldClass(
        props['aria-invalid'] === true,
        `block field-sizing-content max-h-60 min-h-20 resize-y py-2 ${className ?? ''}`,
      )}
      {...props}
    />
  );
}
