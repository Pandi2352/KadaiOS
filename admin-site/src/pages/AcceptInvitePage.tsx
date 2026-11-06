import type { AcceptAdminInviteInput, ValidateAdminInviteResponse } from '@kadai/shared';
import {
  AuthPage,
  Button,
  fieldRules,
  FormAlert,
  Loader,
  PasswordField,
  PhoneField,
  StatusPage,
  TextField,
  useApiQuery,
  useAuth,
  useForm,
  useToast,
} from '@kadai/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invitesApi } from '@/features/staff/invitesApi';
import { usePageTitle } from '@/hooks/usePageTitle';

interface AcceptFormValues {
  name: string;
  password: string;
  phone: string;
}

const INITIAL_VALUES: AcceptFormValues = {
  name: '',
  password: '',
  phone: '',
};

const RULES = {
  name: fieldRules.text('Full name', { required: true }),
  password: fieldRules.newPassword('Password'),
  phone: fieldRules.phone(),
};

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { showToast } = useToast();
  usePageTitle('Accept Admin Invitation');

  const query = useApiQuery<ValidateAdminInviteResponse>(
    (signal) => (token ? invitesApi.validateToken(token, signal) : Promise.reject(new Error('Missing token'))),
    `validate-token-${token ?? 'none'}`,
  );

  const handleSubmitInvite = async (values: AcceptFormValues) => {
    if (!token) return;
    const input: AcceptAdminInviteInput = {
      token,
      name: values.name,
      password: values.password,
      ...(values.phone.trim() && { phone: values.phone.trim() }),
    };

    const session = await invitesApi.acceptInvite(input);
    setSession(session);
    showToast(`Welcome to KadaiOS, ${session.user.name}!`, { title: 'Account created' });
    navigate('/', { replace: true });
  };

  const { field, handleSubmit, formError, isSubmitting } = useForm({
    initialValues: INITIAL_VALUES,
    rules: RULES,
    onSubmit: handleSubmitInvite,
  });

  if (!token) {
    return (
      <StatusPage
        mark="!"
        title="Missing invitation token"
        message="This page requires an invitation link. Please open the link sent to your email."
        actions={
          <Button variant="primary" onClick={() => navigate('/login')}>
            Go to login
          </Button>
        }
      />
    );
  }

  if (query.isLoading) {
    return <Loader label="Verifying your invitation" />;
  }

  if (query.error || !query.data?.valid) {
    return (
      <StatusPage
        mark="!"
        title="Invalid or expired invitation"
        message="This invitation link is invalid or has expired. Please ask your shop administrator to send a new invitation."
        actions={
          <Button variant="primary" onClick={() => navigate('/login')}>
            Go to login
          </Button>
        }
      />
    );
  }

  const email = query.data.email;

  return (
    <AuthPage
      title="Join KadaiOS as an Admin"
      description="Set up your name and secure password to activate your administrator account."
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormAlert message={formError} />
        <TextField
          label="Email address"
          value={email}
          disabled
          hint="Your administrator account will be linked to this email address."
          onChange={() => {}}
        />
        <TextField
          {...field('name')}
          label="Full name"
          placeholder="For example, Selvam Kumar"
          autoComplete="name"
          required
        />
        <PasswordField
          {...field('password')}
          label="Password"
          autoComplete="new-password"
          placeholder="Choose a strong password"
          showStrength
          required
        />
        <PhoneField {...field('phone')} label="Phone number" hint="Optional. Used for shop operations and alerts." />
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
          Create Account & Log In
        </Button>
      </form>
    </AuthPage>
  );
}
