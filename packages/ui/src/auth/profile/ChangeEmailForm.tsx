import type { ChangeEmailInput } from '@kadai/shared';
import { Button } from '../../components/Button';
import { EmailField } from '../../components/form/EmailField';
import { FormAlert } from '../../components/form/FormAlert';
import { PasswordField } from '../../components/form/PasswordField';
import { fieldRules } from '../../components/form/validation/fieldRules';
import { useToast } from '../../components/toast/ToastContext';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../AuthProvider';

const EMPTY_VALUES: ChangeEmailInput = { email: '', currentPassword: '' };
const RULES = { email: fieldRules.email('New email'), currentPassword: fieldRules.currentPassword('Current password') };

export function ChangeEmailForm({ onChanged }: { onChanged: (email: string) => void }) {
  const { changeEmail } = useAuth();
  const { showToast } = useToast();
  const { field, handleSubmit, formError, isSubmitting, reset } = useForm({
    initialValues: EMPTY_VALUES,
    rules: RULES,
    onSubmit: async (values) => {
      const user = await changeEmail(values);
      onChanged(user.email);
      reset();
      showToast('Use it the next time you log in. Any other devices have been logged out.', { title: 'Email changed' });
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <EmailField {...field('email')} label="New email" autoComplete="email" />
      <PasswordField
        {...field('currentPassword')}
        label="Current password"
        autoComplete="current-password"
        placeholder="Enter your current password"
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting}>
        Change email
      </Button>
    </form>
  );
}
