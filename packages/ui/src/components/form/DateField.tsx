import { DatePicker } from './date/DatePicker';
import { type FieldProps, FormField } from './FormField';

interface DateFieldProps extends FieldProps<string> {
  placeholder?: string;
  /** The earliest day allowed, such as 2026-01-01. */
  min?: string;
  /** The latest day allowed. */
  max?: string;
  /** Shows a clear action in the calendar. Use on optional fields. */
  clearable?: boolean;
}

/** The value is a calendar day such as 2026-11-06, or empty. */
export function DateField({ label, value, onChange, error, hint, required, disabled, ...pickerProps }: DateFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      {(control) => <DatePicker {...control} {...pickerProps} value={value} disabled={disabled} onChange={onChange} />}
    </FormField>
  );
}
