import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { type KeyboardEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/ui/Dialog';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { cn, IconChip } from '@kadai/ui';
import { type CommandItem, useCommandItems } from './useCommandItems';

/** Search state lives here and only mounts while open, so it resets each time. */
function CommandSearch() {
  const { setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const items = useCommandItems(query);

  const select = (item: CommandItem | undefined) => {
    if (!item) return;
    setOpen(false);
    navigate(item.path);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && items.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
    }
    if (event.key === 'ArrowUp' && items.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      select(items[activeIndex]);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b border-popup-line px-3">
        <MagnifyingGlassIcon size={20} aria-hidden className="shrink-0 text-muted" />
        <input
          data-autofocus
          role="combobox"
          aria-expanded
          aria-controls="command-results"
          aria-activedescendant={items[activeIndex]?.id}
          aria-label="Search pages and actions"
          placeholder="Search pages and actions"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="h-11 w-full bg-transparent outline-none placeholder:text-muted"
        />
      </div>
      <ul id="command-results" role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-1">
        {items.map((item, index) => {
          return (
            <li
              key={item.id}
              id={item.id}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => select(item)}
              onMouseMove={() => setActiveIndex(index)}
              className={cn(
                'flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-1.5',
                index === activeIndex && 'bg-hover',
              )}
            >
              <IconChip icon={item.icon} />
              <span className="truncate">{item.label}</span>
              <span className="ml-auto text-xs text-muted">{item.hint}</span>
            </li>
          );
        })}
      </ul>
      {items.length === 0 && (
        <p className="px-3 pb-4 text-muted">Nothing matches "{query}". Try a module name, like Products.</p>
      )}
    </>
  );
}

export function CommandPalette() {
  const { isOpen, setOpen } = useCommandPalette();

  return (
    <Dialog isOpen={isOpen} onClose={() => setOpen(false)} aria-label="Search KadaiOS" className="mt-[12vh] max-w-lg">
      {isOpen && <CommandSearch />}
    </Dialog>
  );
}
