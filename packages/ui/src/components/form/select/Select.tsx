import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useRef } from 'react';
import { cn } from '../../../cn';
import { fieldClass } from '../fieldStyles';
import { SelectOptionItem } from './SelectOptionItem';
import type { SelectOption } from './selectOptions';
import { useSelect } from './useSelect';

export type { SelectOption } from './selectOptions';

interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T | '';
  onChange: (value: T | '') => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  noResultsMessage?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

/** The common dropdown: a combobox and listbox with full keyboard support, not a native select. */
export function Select<T extends string>({
  options,
  value,
  onChange,
  id,
  placeholder = 'Choose an option',
  disabled = false,
  searchable = false,
  clearable = false,
  noResultsMessage = 'Nothing matches your search.',
  ...aria
}: SelectProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const {
    listboxId,
    optionId,
    isOpen,
    query,
    activeIndex,
    activeDescendant,
    panelStyle,
    visibleOptions,
    selected,
    toggle,
    choose,
    clear,
    search,
    setActiveIndex,
    handleKeyDown,
  } = useSelect({ options, value, onChange, disabled, searchable, rootRef, triggerRef, searchRef });

  const SelectedIcon = selected?.icon;

  return (
    <div ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={searchable ? undefined : activeDescendant}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={cn(
          fieldClass(aria['aria-invalid'] === true, 'flex h-9 cursor-pointer items-center gap-2 text-left'),
          disabled && 'cursor-not-allowed',
        )}
        {...aria}
      >
        {SelectedIcon && <SelectedIcon size={16} aria-hidden className="shrink-0" />}
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-muted')}>
          {selected?.label ?? placeholder}
        </span>
        <CaretDownIcon
          weight="bold"
          size={16}
          aria-hidden
          className={cn('shrink-0 text-muted transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          style={panelStyle}
          // Keeps focus on the trigger or search box while pressing an option or the list's scrollbar.
          onMouseDown={(event) => event.target !== searchRef.current && event.preventDefault()}
          className="fixed z-50 flex min-w-40 flex-col rounded-md border border-line bg-surface"
        >
          {searchable && (
            <div className="flex shrink-0 items-center gap-2 border-b border-line px-2">
              <MagnifyingGlassIcon size={16} aria-hidden className="shrink-0 text-muted" />
              <input
                ref={searchRef}
                role="combobox"
                aria-label="Search options"
                aria-autocomplete="list"
                aria-expanded
                aria-controls={listboxId}
                aria-activedescendant={activeDescendant}
                placeholder="Search"
                value={query}
                onChange={(event) => search(event.target.value)}
                onKeyDown={handleKeyDown}
                className="h-9 w-full bg-transparent outline-none placeholder:text-muted"
              />
            </div>
          )}

          <ul id={listboxId} role="listbox" aria-label="Options" className="min-h-0 flex-1 overflow-y-auto p-1">
            {visibleOptions.map((option, index) => (
              <SelectOptionItem
                key={option.value}
                id={optionId(index)}
                option={option}
                isSelected={option.value === value}
                isActive={index === activeIndex}
                onSelect={() => choose(option)}
                onHover={() => setActiveIndex(index)}
              />
            ))}
          </ul>
          {visibleOptions.length === 0 && <p className="px-3 pb-3 text-muted">{noResultsMessage}</p>}

          {clearable && value !== '' && (
            <button
              type="button"
              tabIndex={-1}
              onClick={clear}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-2 border-t border-line px-3 text-muted hover:bg-hover hover:text-ink"
            >
              <XIcon size={16} aria-hidden />
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
