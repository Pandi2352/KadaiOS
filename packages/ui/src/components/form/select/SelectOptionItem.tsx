import { CheckIcon } from '@phosphor-icons/react';
import { cn } from '../../../cn';
import type { SelectOption } from './selectOptions';

interface SelectOptionItemProps<T extends string> {
  id: string;
  option: SelectOption<T>;
  isSelected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export function SelectOptionItem<T extends string>({
  id,
  option,
  isSelected,
  isActive,
  onSelect,
  onHover,
}: SelectOptionItemProps<T>) {
  const Icon = option.icon;

  return (
    <li
      id={id}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled || undefined}
      onClick={option.disabled ? undefined : onSelect}
      onMouseMove={option.disabled ? undefined : onHover}
      className={cn(
        'flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5',
        option.disabled ? 'cursor-not-allowed text-muted opacity-60' : 'cursor-pointer',
        isActive && 'bg-hover',
        isSelected && 'font-medium text-brand-strong',
      )}
    >
      {Icon && <Icon size={16} aria-hidden className="shrink-0" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{option.label}</span>
        {option.description && (
          <span className="block truncate text-xs font-normal text-muted">{option.description}</span>
        )}
      </span>
      {isSelected && <CheckIcon weight="bold" size={16} aria-hidden className="shrink-0" />}
    </li>
  );
}
