import type { LoginInput } from '@kadai/shared';
import { Button } from '../components/Button';
import { EmailField } from '../components/form/EmailField';
import { FormAlert } from '../components/form/FormAlert';
import { PasswordField } from '../components/form/PasswordField';
import { fieldRules } from '../components/form/validation/fieldRules';
import { useForm } from '../hooks/useForm';

const EMPTY_VALUES: LoginInput = { email: '', password: '' };
const RULES = { email: fieldRules.email(), password: fieldRules.currentPassword() };

/** The same form on the admin app and the customer site. Each passes its own login. */
export function LoginForm({ onSubmit }: { onSubmit: (values: LoginInput) => Promise<void> }) {
  const { field, handleSubmit, formError, isSubmitting } = useForm({
    initialValues: EMPTY_VALUES,
    rules: RULES,
    onSubmit,
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <EmailField {...field('email')} />
      <PasswordField
        {...field('password')}
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        Log in
      </Button>
    </form>
  );
}
