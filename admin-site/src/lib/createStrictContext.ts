import { createContext, useContext } from 'react';

/** Creates a context whose hook throws when used outside its provider. */
export function createStrictContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  const useStrictContext = (): T => {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(`${name} hook must be used inside ${name}Provider`);
    }
    return value;
  };

  return [Context.Provider, useStrictContext] as const;
}
