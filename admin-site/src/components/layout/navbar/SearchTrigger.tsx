import { buttonClass, Tooltip } from '@kadai/ui';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useCommandPalette } from '@/context/CommandPaletteContext';

export function SearchTrigger() {
  const { setOpen } = useCommandPalette();

  return (
    <Tooltip label="Search pages and actions" shortcut="Ctrl K" side="bottom">
      <button
        type="button"
        aria-label="Search"
        aria-keyshortcuts="Control+K"
        onClick={() => setOpen(true)}
        className={buttonClass(
          'ghost',
          'icon',
          'font-normal text-muted lg:w-52 lg:justify-start lg:border lg:border-line lg:px-3',
        )}
      >
        <MagnifyingGlassIcon size={20} aria-hidden />
        <span className="hidden lg:inline">Search</span>
        <kbd className="ml-auto hidden font-sans text-xs lg:inline">Ctrl K</kbd>
      </button>
    </Tooltip>
  );
}
