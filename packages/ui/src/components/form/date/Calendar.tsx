import { CaretDoubleLeftIcon, CaretDoubleRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import type { KeyboardEvent, RefObject } from 'react';
import { cn } from '../../../cn';
import { FieldAction } from '../FieldAction';
import {
  addDays,
  addMonths,
  clampDate,
  endOfWeek,
  formatDateKey,
  formatMonth,
  isInRange,
  isMonthInRange,
  isSameMonth,
  monthGrid,
  startOfWeek,
  WEEKDAYS,
} from './dateValue';

const DAYS_PER_WEEK = 7;

interface CalendarProps {
  /** The day the keyboard is on. Its month is the one shown. */
  activeDate: string;
  value: string;
  today: string;
  min?: string;
  max?: string;
  gridRef: RefObject<HTMLDivElement | null>;
  onActiveChange: (date: string, moveFocus: boolean) => void;
  onSelect: (date: string) => void;
}

/** One month of days. Arrow keys move by day and week, Page Up and Down by month, Shift with them by year. */
export function Calendar({ activeDate, value, today, min, max, gridRef, onActiveChange, onSelect }: CalendarProps) {
  const days = monthGrid(activeDate);
  const weeks = Array.from({ length: days.length / DAYS_PER_WEEK }, (_, week) =>
    days.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
  );

  const moveMonths = (months: number) => {
    onActiveChange(clampDate(addMonths(activeDate, months), min, max), false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const yearOr = (months: number) => (event.shiftKey ? months * 12 : months);
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(activeDate, -1),
      ArrowRight: () => addDays(activeDate, 1),
      ArrowUp: () => addDays(activeDate, -DAYS_PER_WEEK),
      ArrowDown: () => addDays(activeDate, DAYS_PER_WEEK),
      Home: () => startOfWeek(activeDate),
      End: () => endOfWeek(activeDate),
      PageUp: () => addMonths(activeDate, yearOr(-1)),
      PageDown: () => addMonths(activeDate, yearOr(1)),
    };
    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();
    onActiveChange(clampDate(move(), min, max), true);
  };

  const navigation = (months: number, label: string, icon: typeof CaretLeftIcon) => (
    <FieldAction
      icon={icon}
      label={label}
      disabled={!isMonthInRange(addMonths(activeDate, months), min, max)}
      onClick={() => moveMonths(months)}
    />
  );

  return (
    <div>
      <div className="mb-2 flex items-center gap-1">
        {navigation(-12, 'Previous year', CaretDoubleLeftIcon)}
        {navigation(-1, 'Previous month', CaretLeftIcon)}
        <p aria-live="polite" className="flex-1 text-center font-semibold text-ink">
          {formatMonth(activeDate)}
        </p>
        {navigation(1, 'Next month', CaretRightIcon)}
        {navigation(12, 'Next year', CaretDoubleRightIcon)}
      </div>

      <div ref={gridRef} role="grid" aria-label={formatMonth(activeDate)} onKeyDown={handleKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map(({ short, long }) => (
            <span key={long} role="columnheader" aria-label={long} className="py-1 text-center text-xs text-muted">
              {short}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0]} role="row" className="grid grid-cols-7">
            {week.map((day) => {
              const isSelected = day === value;
              const isOutside = !isSameMonth(day, activeDate);
              return (
                <button
                  key={day}
                  type="button"
                  role="gridcell"
                  data-active={day === activeDate || undefined}
                  tabIndex={day === activeDate ? 0 : -1}
                  disabled={!isInRange(day, min, max)}
                  aria-selected={isSelected}
                  aria-current={day === today ? 'date' : undefined}
                  aria-label={formatDateKey(day)}
                  onClick={() => onSelect(day)}
                  className={cn(
                    'flex h-9 cursor-pointer items-center justify-center rounded-md border border-transparent transition-colors focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-40',
                    isSelected ? 'bg-brand text-on-brand' : 'hover:bg-hover',
                    !isSelected && isOutside && 'text-muted',
                    day === today && !isSelected && 'border-brand font-semibold',
                  )}
                >
                  {Number(day.slice(8))}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
