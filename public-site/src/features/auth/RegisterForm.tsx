import { FIELD_LIMITS, PASSWORD_LIMITS, type RegisterInput } from '@kadai/shared';
import {
  Button,
  EmailField,
  fieldRules,
  FormAlert,
  PasswordField,
  PhoneField,
  TextField,
  useAuth,
  useForm,
  useToast,
} from '@kadai/ui';

const EMPTY_VALUES: Required<RegisterInput> = { name: '', email: '', phone: '', password: '' };
const RULES = {
  name: fieldRules.text('Name', { required: true }),
  email: fieldRules.email(),
  phone: fieldRules.phone(),
  password: fieldRules.newPassword(),
};

export function RegisterForm() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const { field, handleSubmit, formError, isSubmitting } = useForm({
    initialValues: EMPTY_VALUES,
    rules: RULES,
    onSubmit: async (values) => {
      await register(values);
      showToast(`Welcome, ${values.name.trim()}.`, { title: 'Account created' });
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <TextField
        {...field('name')}
        label="Name"
        placeholder="Your full name"
        maxLength={FIELD_LIMITS.shortText}
        autoComplete="name"
      />
      <EmailField {...field('email')} />
      <PhoneField {...field('phone')} />
      <PasswordField
        {...field('password')}
        label="Password"
        autoComplete="new-password"
        placeholder="Create a password"
        hint={`At least ${PASSWORD_LIMITS.min} characters.`}
        showStrength
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        Create account
      </Button>
    </form>
  );
}
