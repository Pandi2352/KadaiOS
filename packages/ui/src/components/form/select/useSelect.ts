import { type KeyboardEvent, type RefObject, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { type DismissReason, useDismiss } from '../../../hooks/useDismiss';
import { useFloatingPosition } from '../../../hooks/useFloatingPosition';
import {
  filterOptions,
  findTypeaheadMatch,
  firstEnabledIndex,
  lastEnabledIndex,
  nextEnabledIndex,
  type SelectOption,
} from './selectOptions';

const TYPEAHEAD_RESET_MS = 500;
const OPEN_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'];

interface UseSelectOptions<T extends string> {
  options: SelectOption<T>[];
  value: T | '';
  onChange: (value: T | '') => void;
  disabled: boolean;
  searchable: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  searchRef: RefObject<HTMLInputElement | null>;
}

/** The state, keyboard behaviour and positioning behind Select. */
export function useSelect<T extends string>({
  options,
  value,
  onChange,
  disabled,
  searchable,
  rootRef,
  triggerRef,
  searchRef,
}: UseSelectOptions<T>) {
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
  const optionId = useCallback((index: number) => `${generatedId}-option-${index}`, [generatedId]);

  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const typeahead = useRef({ text: '', timer: 0 });
  const dismissRefs = useMemo(() => [rootRef], [rootRef]);

  const { style: panelStyle, update: updatePosition } = useFloatingPosition(triggerRef, isOpen);
  const visibleOptions = useMemo(() => filterOptions(options, query), [options, query]);
  const selected = options.find((option) => option.value === value);

  const open = () => {
    if (disabled) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    updatePosition();
    setQuery('');
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(options));
    setOpen(true);
  };

  const close = useCallback(
    (restoreFocus: boolean) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [triggerRef],
  );

  const handleDismiss = useCallback((reason: DismissReason) => close(reason === 'escape'), [close]);
  useDismiss(dismissRefs, handleDismiss, isOpen);

  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus();
  }, [isOpen, searchable, searchRef]);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, activeIndex, optionId]);

  useEffect(() => {
    const state = typeahead.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  const choose = (option: SelectOption<T> | undefined) => {
    if (!option || option.disabled) return;
    onChange(option.value);
    close(true);
  };

  const clear = () => {
    onChange('');
    close(true);
  };

  const search = (next: string) => {
    setQuery(next);
    setActiveIndex(firstEnabledIndex(filterOptions(options, next)));
  };

  const runTypeahead = (character: string) => {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.text += character;
    state.timer = window.setTimeout(() => {
      state.text = '';
    }, TYPEAHEAD_RESET_MS);

    // Repeating one letter cycles through options starting with it, like a native dropdown.
    const repeated = [...state.text].every((letter) => letter === state.text[0]);
    const from = state.text.length > 1 && !repeated ? activeIndex - 1 : activeIndex;
    const match = findTypeaheadMatch(visibleOptions, repeated ? state.text[0] : state.text, from);
    if (match >= 0) setActiveIndex(match);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const isCharacter = key.length === 1 && key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (!isOpen) {
      if (OPEN_KEYS.includes(key)) {
        event.preventDefault();
        open();
      } else if (isCharacter) {
        open();
        runTypeahead(key);
      }
      return;
    }

    const moves: Record<string, () => number> = {
      ArrowDown: () => nextEnabledIndex(visibleOptions, activeIndex, 1),
      ArrowUp: () => nextEnabledIndex(visibleOptions, activeIndex < 0 ? 0 : activeIndex, -1),
      Home: () => firstEnabledIndex(visibleOptions),
      End: () => lastEnabledIndex(visibleOptions),
    };

    if (moves[key] && visibleOptions.length > 0) {
      event.preventDefault();
      setActiveIndex(moves[key]());
    } else if (key === 'Enter' || (key === ' ' && !searchable)) {
      event.preventDefault();
      choose(visibleOptions[activeIndex]);
    } else if (key === 'Escape') {
      // Stops a surrounding modal closing together with the list.
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (key === 'Tab') {
      close(false);
    } else if (isCharacter && !searchable) {
      runTypeahead(key);
    }
  };

  return {
    listboxId,
    optionId,
    isOpen,
    query,
    activeIndex,
    activeDescendant: isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined,
    panelStyle,
    visibleOptions,
    selected,
    toggle: () => (isOpen ? close(true) : open()),
    choose,
    clear,
    search,
    setActiveIndex,
    handleKeyDown,
  };
}
