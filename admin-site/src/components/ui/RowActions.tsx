import type { ReactNode } from 'react';

/**
 * A table row's buttons. They appear on hover, so a long table stays quiet, and stay visible while
 * they have keyboard focus, while a menu is open, and on touch screens, which have no hover.
 * Clicks here don't count as clicking the row.
 */
export function RowActions({ children }: { children: ReactNode }) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="flex justify-end gap-1 text-left opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 pointer-coarse:opacity-100"
    >
      {children}
    </div>
  );
}
