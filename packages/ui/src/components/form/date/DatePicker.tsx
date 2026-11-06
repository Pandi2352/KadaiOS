import { CalendarBlankIcon } from '@phosphor-icons/react';
import { type FocusEvent, type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../cn';
import { type DismissReason, useDismiss } from '../../../hooks/useDismiss';
import { useFloatingPosition } from '../../../hooks/useFloatingPosition';
import { fieldClass } from '../fieldStyles';
import { Calendar } from './Calendar';
import { clampDate, formatDateKey, isInRange, todayKey } from './dateValue';

const PANEL_HEIGHT = 380;
const FOOTER_BUTTON =
  'h-8 cursor-pointer rounded-md px-3 font-medium text-brand transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50';

interface DatePickerProps {
  /** A calendar day such as 2026-11-06, or empty. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  id?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  clearable?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  'aria-labelledby'?: string;
}

/** The common date picker. It looks the same in every browser, which a native date input doesn't. */
export function DatePicker({
  value,
  onChange,
  onBlur,
  id,
  placeholder = 'Choose a date',
  min,
  max,
  disabled = false,
  clearable = false,
  ...aria
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldMoveFocus = useRef(false);
  const dismissRefs = useMemo(() => [rootRef], []);

  const [isOpen, setOpen] = useState(false);
  const [activeDate, setActiveDate] = useState('');
  const { style, update } = useFloatingPosition(triggerRef, isOpen, PANEL_HEIGHT);

  const today = todayKey();
  const canPickToday = isInRange(today, min, max);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const handleDismiss = useCallback((reason: DismissReason) => close(reason === 'escape'), [close]);
  useDismiss(dismissRefs, handleDismiss, isOpen);

  // Runs after the new month has rendered, so the day being moved to exists.
  useEffect(() => {
    if (!isOpen || !shouldMoveFocus.current) return;
    shouldMoveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('[data-active]')?.focus();
  }, [isOpen, activeDate]);

  const open = () => {
    update();
    shouldMoveFocus.current = true;
    setActiveDate(clampDate(value || today, min, max));
    setOpen(true);
  };

  const select = (date: string) => {
    onChange(date);
    close(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && isOpen) {
      // Stops a surrounding modal closing together with the calendar.
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };

  return (
    <div
      ref={rootRef}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setOpen(false);
        onBlur?.(event);
      }}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close(true) : open())}
        className={fieldClass(
          aria['aria-invalid'] === true,
          cn('flex h-9 items-center gap-2 text-left', !disabled && 'cursor-pointer'),
        )}
        {...aria}
      >
        <CalendarBlankIcon size={18} aria-hidden className="shrink-0 text-muted" />
        <span className={cn('min-w-0 flex-1 truncate', !value && 'text-muted')}>
          {value ? formatDateKey(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose a date"
          style={{ ...style, width: undefined }}
          // Keeps focus in the calendar when pressing its buttons or the space between them.
          onMouseDown={(event) => event.preventDefault()}
          className="fixed z-50 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border popup-surface p-2"
        >
          <Calendar
            activeDate={activeDate}
            value={value}
            today={today}
            min={min}
            max={max}
            gridRef={gridRef}
            onActiveChange={(date, moveFocus) => {
              shouldMoveFocus.current = moveFocus;
              setActiveDate(date);
            }}
            onSelect={select}
          />
          <div className="mt-2 flex items-center justify-between border-t border-popup-line pt-2">
            <button type="button" disabled={!canPickToday} onClick={() => select(today)} className={FOOTER_BUTTON}>
              Today
            </button>
            {clearable && value !== '' && (
              <button type="button" onClick={() => select('')} className={FOOTER_BUTTON}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
