import { type FormEvent, useCallback, useState } from 'react';
import { ApiError, getErrorMessage } from '@/lib/api/ApiError';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
}

/**
 * Handles values, submitting and errors for every form. Errors from the API appear
 * under their fields, and anything else appears in formError for FormAlert to show.
 */
export function useForm<T extends object>({ initialValues, onSubmit }: UseFormOptions<T>) {
  const [initial] = useState(initialValues);
  const [values, setValues] = useState<T>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }, []);

  const field = <K extends keyof T & string>(name: K) => ({
    value: values[name],
    error: fieldErrors[name],
    onChange: (value: T[K]) => setValue(name, value),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setFormError(undefined);
    setFieldErrors({});

    try {
      await onSubmit(values);
    } catch (error) {
      const fields = error instanceof ApiError ? error.fields : {};
      const known = Object.keys(fields).filter((name) => name in values);

      if (known.length > 0) {
        setFieldErrors(Object.fromEntries(known.map((name) => [name, fields[name][0]])));
        requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
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
