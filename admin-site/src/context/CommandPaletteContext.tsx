import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { createStrictContext } from '@/lib/createStrictContext';

interface CommandPaletteValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const [Provider, useCommandPalette] = createStrictContext<CommandPaletteValue>('CommandPalette');

export { useCommandPalette };

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const value = useMemo(() => ({ isOpen, setOpen }), [isOpen]);

  return <Provider value={value}>{children}</Provider>;
}
