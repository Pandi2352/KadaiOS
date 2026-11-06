import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { buttonClass, type ButtonVariant } from './buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  /** Disables the button and shows a spinner while an action runs. */
  isLoading?: boolean;
}

export function Button({
  variant,
  icon: Icon,
  isLoading = false,
  disabled,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClass(variant, 'text', className)}
      {...props}
    >
      {isLoading ? (
        <LoaderCircle size={16} aria-hidden className="animate-spin" />
      ) : (
        Icon && <Icon size={16} aria-hidden />
      )}
      {children}
    </button>
  );
}
