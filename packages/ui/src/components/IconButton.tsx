import type { ButtonHTMLAttributes } from 'react';
import { type ButtonVariant, iconButtonClass } from './buttonStyles';
import type { IconComponent } from './iconTypes';
import { Tooltip } from './tooltip/Tooltip';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconComponent;
  /** Required: the icon has no visible text, so this is its accessible name and tooltip. */
  label: string;
  variant?: ButtonVariant;
}

export function IconButton({ icon: Icon, label, variant, className, ...props }: IconButtonProps) {
  return (
    <Tooltip label={label}>
      <button type="button" aria-label={label} className={iconButtonClass(variant, className)} {...props}>
        <Icon size={18} aria-hidden weight="bold" />
      </button>
    </Tooltip>
  );
}
