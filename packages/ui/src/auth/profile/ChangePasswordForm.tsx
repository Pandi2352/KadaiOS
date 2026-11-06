import { PASSWORD_LIMITS } from '@kadai/shared';
import { Button } from '../../components/Button';
import { FormAlert } from '../../components/form/FormAlert';
import { PasswordField } from '../../components/form/PasswordField';
import { fieldRules } from '../../components/form/validation/fieldRules';
import type { FormRules } from '../../components/form/validation/validateField';
import { useToast } from '../../components/toast/ToastContext';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../AuthProvider';

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_VALUES: ChangePasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

const RULES: FormRules<ChangePasswordValues> = {
  currentPassword: fieldRules.currentPassword('Current password'),
  newPassword: fieldRules.newPassword('New password'),
  confirmPassword: {
    label: 'Confirm new password',
    required: true,
    keepSpaces: true,
    validate: (value, { newPassword }) => (value === newPassword ? undefined : 'Passwords must match'),
  },
};

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const { field, handleSubmit, formError, isSubmitting, reset } = useForm({
    initialValues: EMPTY_VALUES,
    rules: RULES,
    onSubmit: async ({ currentPassword, newPassword }) => {
      await changePassword({ currentPassword, newPassword });
      reset();
      showToast('Any other devices have been logged out.', { title: 'Password changed' });
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <PasswordField
        {...field('currentPassword')}
        label="Current password"
        autoComplete="current-password"
        placeholder="Enter your current password"
      />
      <PasswordField
        {...field('newPassword')}
        label="New password"
        autoComplete="new-password"
        placeholder="Create a new password"
        hint={`At least ${PASSWORD_LIMITS.min} characters.`}
        showStrength
      />
      <PasswordField
        {...field('confirmPassword')}
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Type it again"
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting}>
        Change password
      </Button>
    </form>
  );
}
