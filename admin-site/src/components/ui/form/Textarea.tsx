import type { TextareaHTMLAttributes } from 'react';
import { fieldClass } from './fieldStyles';

export function Textarea({ className, rows = 3, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={fieldClass(props['aria-invalid'] === true, `py-2 ${className ?? ''}`)}
      {...props}
    />
  );
}
