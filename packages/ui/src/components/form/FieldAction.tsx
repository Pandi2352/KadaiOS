import type { Icon } from '@phosphor-icons/react';
import { Tooltip } from '../tooltip/Tooltip';

interface FieldActionProps {
  icon: Icon;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

/** A small button inside a field, such as show password, clear, or plus and minus. */
export function FieldAction({ icon: ActionIcon, label, disabled, onClick }: FieldActionProps) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ActionIcon size={16} weight="bold" aria-hidden />
      </button>
    </Tooltip>
  );
}
