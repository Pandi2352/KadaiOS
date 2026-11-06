import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { type ButtonVariant, iconButtonClass } from './buttonStyles';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Required: the icon has no visible text, so this is its accessible name. */
  label: string;
  variant?: ButtonVariant;
}

export function IconButton({ icon: Icon, label, variant, className, ...props }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} className={iconButtonClass(variant, className)} {...props}>
      <Icon size={18} aria-hidden />
    </button>
  );
}
