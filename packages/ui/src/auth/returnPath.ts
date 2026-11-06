import type { Location } from 'react-router-dom';

export interface RedirectState {
  from?: Location;
}

/** Where to go after logging in: the page that sent them to log in, or the fallback. */
export function getReturnPath(state: unknown, fallback: string): string {
  const from = (state as RedirectState | null)?.from;
  return from ? `${from.pathname}${from.search}${from.hash}` : fallback;
}
