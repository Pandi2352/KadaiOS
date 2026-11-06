import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn, type IconComponent } from '@kadai/ui';

const itemClass = (isActive = false) =>
  cn(
    'flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
    isActive ? 'bg-brand-soft font-medium text-brand-strong' : 'text-ink hover:bg-hover',
  );

interface MenuLinkProps {
  to: string;
  icon?: IconComponent;
  children: ReactNode;
}

export function MenuLink({ to, icon: Icon, children }: MenuLinkProps) {
  return (
    <Link to={to} className={itemClass()}>
      {Icon && <Icon size={16} aria-hidden className="shrink-0 text-muted" />}
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

export function MenuButton({ icon: Icon, isActive, onClick, children }: MenuButtonProps) {
  return (
    <button type="button" aria-pressed={isActive} onClick={onClick} className={itemClass(isActive)}>
      {Icon && <Icon size={16} aria-hidden className="shrink-0" />}
      {children}
    </button>
  );
}

export function MenuNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-2 py-2">
      <p className="font-medium">{title}</p>
      <p className="mt-0.5 text-muted">{children}</p>
    </div>
  );
}
