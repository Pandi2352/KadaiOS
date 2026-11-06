import { type FocusEvent, type FormEvent, useState } from 'react';
import { flushSync } from 'react-dom';
import { ApiError, getErrorMessage } from '../api/ApiError';
import { type FormRules, validateField } from '../components/form/validation/validateField';

type FieldErrors = Partial<Record<string, string>>;

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  /** Checked in the browser on blur and on submit. Fields with `required` also get their required mark from here. */
  rules?: FormRules<T>;
}

/** Puts the errors on screen first, so the first invalid field can then take focus. */
const showFieldErrors = (form: HTMLFormElement, setErrors: (errors: FieldErrors) => void, errors: FieldErrors) => {
  flushSync(() => setErrors(errors));
  form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
};

/**
 * Handles values, validation, submitting and errors for every form. Rule errors and errors from
 * the API appear under their fields, and anything else appears in formError for FormAlert to show.
 */
export function useForm<T extends object>({ initialValues, onSubmit, rules }: UseFormOptions<T>) {
  const [initial] = useState(initialValues);
  const [values, setValues] = useState<T>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);

  const validate = <K extends keyof T>(name: K, currentValues: T) => {
    const rule = rules?.[name];
    return rule && validateField(rule, currentValues[name], currentValues);
  };

  const setValue = <K extends keyof T>(name: K, value: T[K]) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // A field already showing an error is rechecked while typing, so the error goes as soon as it's fixed.
    setFieldErrors((current) => (current[name as string] ? { ...current, [name]: validate(name, next) } : current));
  };

  const handleBlur = <K extends keyof T & string>(name: K, event: FocusEvent<HTMLElement>) => {
    // Showing an error now could move a button away while it's being clicked. Submit checks everything anyway.
    if ((event.relatedTarget as Element | null)?.closest('button')) return;
    // The tab or window lost focus, and the person hasn't left the field.
    if (document.activeElement === event.target) return;
    setFieldErrors((current) => ({ ...current, [name]: validate(name, values) }));
  };

  const field = <K extends keyof T & string>(name: K) => ({
    value: values[name],
    error: fieldErrors[name],
    required: rules?.[name]?.required,
    onChange: (value: T[K]) => setValue(name, value),
    onBlur: (event: FocusEvent<HTMLElement>) => handleBlur(name, event),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    setFormError(undefined);

    const names = Object.keys(values) as (keyof T & string)[];
    const invalid = names.flatMap((name) => {
      const message = validate(name, values);
      return message ? [[name, message]] : [];
    });
    if (invalid.length > 0) {
      showFieldErrors(form, setFieldErrors, Object.fromEntries(invalid));
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      await onSubmit(values);
    } catch (error) {
      const fields = error instanceof ApiError ? error.fields : {};
      const known = Object.keys(fields).filter((name) => name in values);

      if (known.length > 0) {
        showFieldErrors(form, setFieldErrors, Object.fromEntries(known.map((name) => [name, fields[name][0]])));
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDirty = (Object.keys(values) as (keyof T)[]).some((name) => values[name] !== initial[name]);

  return { values, field, setValue, handleSubmit, fieldErrors, formError, isSubmitting, isDirty };
}
