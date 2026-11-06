import { FieldAction, Input } from '@kadai/ui';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';

interface SearchBoxProps {
  /** Names the box for screen readers. */
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** A search field for lists, with an X to clear it. */
export function SearchBox({ label, placeholder, value, onChange }: SearchBoxProps) {
  return (
    <Input
      aria-label={label}
      placeholder={placeholder}
      startIcon={MagnifyingGlassIcon}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      endSlot={value && <FieldAction icon={XIcon} label="Clear search" onClick={() => onChange('')} />}
    />
  );
}
