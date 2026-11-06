import { FIELD_LIMITS, type UserProfile } from '@kadai/shared';
import { Button } from '../../components/Button';
import { EmailField } from '../../components/form/EmailField';
import { FormAlert } from '../../components/form/FormAlert';
import { PhoneField } from '../../components/form/PhoneField';
import { TextField } from '../../components/form/TextField';
import { fieldRules } from '../../components/form/validation/fieldRules';
import { useToast } from '../../components/toast/ToastContext';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../AuthProvider';

const RULES = { name: fieldRules.text('Name', { required: true }), phone: fieldRules.phone() };

interface ProfileFormProps {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
}

export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();
  const { field, handleSubmit, formError, isSubmitting, isDirty } = useForm({
    initialValues: { name: profile.name, phone: profile.phone ?? '' },
    rules: RULES,
    onSubmit: async (values) => {
      onSaved(await updateProfile(values));
      showToast('Your details have been saved.', { title: 'Profile updated' });
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
      <EmailField
        required
        disabled
        value={profile.email}
        onChange={() => undefined}
        hint="To change it, use Change email below."
      />
      <PhoneField
        {...field('phone')}
        hint="10 to 15 digits. A + at the start is fine. Clear it to remove your phone."
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
