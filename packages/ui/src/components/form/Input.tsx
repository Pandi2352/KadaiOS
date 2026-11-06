import type { InputHTMLAttributes } from 'react';
import { fieldClass } from './fieldStyles';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldClass(props['aria-invalid'] === true, `h-9 ${className ?? ''}`)} {...props} />;
}
