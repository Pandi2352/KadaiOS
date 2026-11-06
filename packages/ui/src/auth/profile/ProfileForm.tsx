import { FIELD_LIMITS, type UserProfile } from '@kadai/shared';
import { Button } from '../../components/Button';
import { FormAlert } from '../../components/form/FormAlert';
import { TextField } from '../../components/form/TextField';
import { useToast } from '../../components/toast/ToastContext';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../AuthProvider';

interface ProfileFormProps {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
}

export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();
  const { field, handleSubmit, formError, isSubmitting, isDirty } = useForm({
    initialValues: { name: profile.name, phone: profile.phone ?? '' },
    onSubmit: async (values) => {
      onSaved(await updateProfile(values));
      showToast('Your details have been saved.', { title: 'Profile updated' });
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={formError} />
      <TextField {...field('name')} label="Name" required maxLength={FIELD_LIMITS.shortText} autoComplete="name" />
      <TextField
        label="Email"
        required
        disabled
        type="email"
        value={profile.email}
        onChange={() => undefined}
        hint="You can't change your email yet."
      />
      <TextField
        {...field('phone')}
        label="Phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        hint="10 to 15 digits. A + at the start is fine. Clear it to remove your phone."
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
