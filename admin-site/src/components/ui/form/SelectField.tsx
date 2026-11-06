import { type FieldProps, FormField } from './FormField';
import { Select, type SelectOption } from './select/Select';

interface SelectFieldProps<T extends string> extends FieldProps<T | ''> {
  options: SelectOption<T>[];
  placeholder?: string;
  /** Adds a search box, for long lists such as products or suppliers. */
  searchable?: boolean;
  /** Shows a clear action in the list. Use on optional fields. */
  clearable?: boolean;
}

/** The dropdown for every form. Built on Select, never the native select tag. */
export function SelectField<T extends string>({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  ...selectProps
}: SelectFieldProps<T>) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      {(control) => <Select {...control} {...selectProps} value={value} disabled={disabled} onChange={onChange} />}
    </FormField>
  );
}
