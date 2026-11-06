import type { LoginInput } from '@kadai/shared';
import { Button } from '../components/Button';
import { FormAlert } from '../components/form/FormAlert';
import { PasswordField } from '../components/form/PasswordField';
import { TextField } from '../components/form/TextField';
import { useForm } from '../hooks/useForm';

const EMPTY_VALUES: LoginInput = { email: '', password: '' };

/** The same form on the admin app and the customer site. Each passes its own login. */
export function LoginForm({ onSubmit }: { onSubmit: (values: LoginInput) => Promise<void> }) {
  const { field, handleSubmit, formError, isSubmitting } = useForm({ initialValues: EMPTY_VALUES, onSubmit });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <TextField {...field('email')} label="Email" required type="email" inputMode="email" autoComplete="username" />
      <PasswordField {...field('password')} label="Password" required autoComplete="current-password" />
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        Log in
      </Button>
    </form>
  );
}
