import { IconContext } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

const DEFAULTS = { weight: 'duotone' } as const;

/** Wrap each app in this, so every icon shares the duotone style unless it asks for another. */
export function IconDefaults({ children }: { children: ReactNode }) {
  return <IconContext.Provider value={DEFAULTS}>{children}</IconContext.Provider>;
}
