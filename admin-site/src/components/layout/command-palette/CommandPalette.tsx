import { Search } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { cn } from '@/lib/cn';
import { type CommandItem, useCommandItems } from './useCommandItems';

export function CommandPalette() {
  const { isOpen, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const items = useCommandItems(query);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      setQuery('');
      setActiveIndex(0);
      dialog.showModal();
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

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
    <dialog
      ref={dialogRef}
      aria-label="Search KadaiOS"
      onClose={() => setOpen(false)}
      onClick={(event) => event.target === dialogRef.current && setOpen(false)}
      className="mx-auto mt-[12vh] w-[calc(100vw-2rem)] max-w-lg rounded-md border border-line bg-surface text-ink"
    >
      <div className="flex items-center gap-2 border-b border-line px-3">
        <Search size={16} aria-hidden className="shrink-0 text-muted" />
        <input
          autoFocus
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
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              id={item.id}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => select(item)}
              onMouseMove={() => setActiveIndex(index)}
              className={cn(
                'flex h-9 cursor-pointer items-center gap-2 rounded-md px-2',
                index === activeIndex && 'bg-hover',
              )}
            >
              <Icon size={16} aria-hidden className="shrink-0 text-muted" />
              <span className="truncate">{item.label}</span>
              <span className="ml-auto text-xs text-muted">{item.hint}</span>
            </li>
          );
        })}
      </ul>
      {items.length === 0 && (
        <p className="px-3 pb-4 text-muted">Nothing matches "{query}". Try a module name, like Products.</p>
      )}
    </dialog>
  );
}
