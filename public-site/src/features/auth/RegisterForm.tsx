import { EMAIL_MAX_LENGTH, FIELD_LIMITS, PASSWORD_LIMITS, type RegisterInput } from '@kadai/shared';
import { Button, FormAlert, PasswordField, TextField, useAuth, useForm, useToast } from '@kadai/ui';

const EMPTY_VALUES: Required<RegisterInput> = { name: '', email: '', phone: '', password: '' };

export function RegisterForm() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const { field, handleSubmit, formError, isSubmitting } = useForm({
    initialValues: EMPTY_VALUES,
    // The API validates everything and the form shows its messages.
    onSubmit: async (values) => {
      await register(values);
      showToast(`Welcome, ${values.name.trim()}.`, { title: 'Account created' });
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <TextField {...field('name')} label="Name" required maxLength={FIELD_LIMITS.shortText} autoComplete="name" />
      <TextField
        {...field('email')}
        label="Email"
        required
        type="email"
        inputMode="email"
        maxLength={EMAIL_MAX_LENGTH}
        autoComplete="username"
      />
      <TextField
        {...field('phone')}
        label="Phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        hint="10 to 15 digits. A + at the start is fine."
      />
      <PasswordField
        {...field('password')}
        label="Password"
        required
        autoComplete="new-password"
        hint={`At least ${PASSWORD_LIMITS.min} characters.`}
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        Create account
      </Button>
    </form>
  );
}
