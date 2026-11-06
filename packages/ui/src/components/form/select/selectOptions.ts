import type { IconComponent } from '../../iconTypes';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  /** A second line, such as a unit or a supplier's city. */
  description?: string;
  icon?: IconComponent;
  disabled?: boolean;
}

export const filterOptions = <T extends string>(options: SelectOption<T>[], query: string): SelectOption<T>[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return options;
  return options.filter((option) => `${option.label} ${option.description ?? ''}`.toLowerCase().includes(needle));
};

/** The next enabled option in a direction, wrapping at the ends. Returns -1 if none is enabled. */
export function nextEnabledIndex<T extends string>(options: SelectOption<T>[], from: number, step: 1 | -1): number {
  for (let offset = 1; offset <= options.length; offset += 1) {
    const index = (from + step * offset + options.length * offset) % options.length;
    if (!options[index].disabled) return index;
  }
  return -1;
}

export const firstEnabledIndex = <T extends string>(options: SelectOption<T>[]): number =>
  options.findIndex((option) => !option.disabled);

export function lastEnabledIndex<T extends string>(options: SelectOption<T>[]): number {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index].disabled) return index;
  }
  return -1;
}

/** Finds the option someone is typing the name of, starting after the current one. */
export function findTypeaheadMatch<T extends string>(options: SelectOption<T>[], text: string, from: number): number {
  const needle = text.toLowerCase();
  for (let offset = 1; offset <= options.length; offset += 1) {
    const index = (from + offset) % options.length;
    if (!options[index].disabled && options[index].label.toLowerCase().startsWith(needle)) return index;
  }
  return -1;
}
