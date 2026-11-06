import { type Context, createContext, useContext } from 'react';

interface ContextRegistryHost {
  __kadaiContexts?: Map<string, Context<unknown>>;
}

/**
 * Keeps one context per name for the life of the page. A hot reload runs a context's file again,
 * and a new context would disconnect its hook from the provider that's already mounted.
 */
function getContext<T>(name: string): Context<T | null> {
  const host = globalThis as ContextRegistryHost;
  host.__kadaiContexts ??= new Map();

  const existing = host.__kadaiContexts.get(name);
  if (existing) return existing as Context<T | null>;

  const created = createContext<T | null>(null);
  host.__kadaiContexts.set(name, created as Context<unknown>);
  return created;
}

/** Creates a context whose hook throws when used outside its provider. Each name must be unique in the app. */
export function createStrictContext<T>(name: string) {
  const StrictContext = getContext<T>(name);

  const useStrictContext = (): T => {
    const value = useContext(StrictContext);
    if (value === null) {
      throw new Error(`${name} hook must be used inside ${name}Provider`);
    }
    return value;
  };

  return [StrictContext.Provider, useStrictContext] as const;
}
