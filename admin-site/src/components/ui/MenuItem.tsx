import { cn, IconChip, type IconComponent } from '@kadai/ui';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const itemClass = (isActive = false) =>
  cn(
    'flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-sm transition-colors',
    isActive ? 'bg-brand font-medium text-on-brand' : 'text-ink hover:bg-hover',
  );

interface MenuLinkProps {
  to: string;
  icon?: IconComponent;
  children: ReactNode;
}

export function MenuLink({ to, icon, children }: MenuLinkProps) {
  return (
    <Link to={to} className={itemClass()}>
      {icon && <IconChip icon={icon} />}
      {children}
    </Link>
  );
}

interface MenuButtonProps {
  icon?: IconComponent;
  isActive?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function MenuButton({ icon, isActive = false, onClick, children }: MenuButtonProps) {
  return (
    <button type="button" aria-pressed={isActive} onClick={onClick} className={itemClass(isActive)}>
      {icon && <IconChip icon={icon} inverted={isActive} />}
      {children}
    </button>
  );
}

export function MenuNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-1 border-b border-popup-line px-2 py-2 last:mb-0 last:border-b-0">
      <p className="font-medium">{title}</p>
      <p className="mt-0.5 text-muted">{children}</p>
    </div>
  );
}
