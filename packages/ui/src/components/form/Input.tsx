import type { Icon } from '@phosphor-icons/react';
import type { InputHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { cn } from '../../cn';
import { fieldClass } from './fieldStyles';

export interface InputExtras {
  /** An icon at the start of the field. */
  startIcon?: Icon;
  /** Fixed text before the value, such as ₹. */
  startText?: string;
  /** Fixed text after the value, such as kg. */
  endText?: string;
  /** Buttons at the end of the field. Use FieldAction. */
  endSlot?: ReactNode;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & InputExtras & { ref?: Ref<HTMLInputElement> };

/** Clicking the icon or padding focuses the input, because the whole box looks like the field. */
const focusInput = (event: MouseEvent<HTMLDivElement>) => {
  if ((event.target as Element).closest('button, input')) return;
  event.preventDefault();
  event.currentTarget.querySelector('input')?.focus();
};

/** The border is on the wrapper, so icons, text and buttons sit inside the field. */
export function Input({ startIcon: StartIcon, startText, endText, endSlot, className, ...props }: InputProps) {
  return (
    <div
      onMouseDown={focusInput}
      className={fieldClass(props['aria-invalid'] === true, 'flex h-9 cursor-text items-center gap-2')}
    >
      {StartIcon && <StartIcon size={18} aria-hidden className="shrink-0 text-muted" />}
      {startText && <span className="shrink-0 text-muted">{startText}</span>}
      <input
        className={cn(
          'field-input h-full w-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />
      {endText && <span className="shrink-0 text-muted">{endText}</span>}
      {endSlot && <div className="-mr-2 flex shrink-0 items-center">{endSlot}</div>}
    </div>
  );
}
