import type { UserProfile } from '@kadai/shared';
import { useState } from 'react';
import { QueryState } from '../../components/QueryState';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuth } from '../AuthProvider';
import { ChangeEmailForm } from './ChangeEmailForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ProfileForm } from './ProfileForm';
import { ProfileSection } from './ProfileSection';
import { ProfileSummary } from './ProfileSummary';

/** The logged-in person's details and account settings. Both websites show this same card. */
export function ProfileCard() {
  const { getProfile } = useAuth();
  const query = useApiQuery((signal) => getProfile(signal), 'profile');
  const [saved, setSaved] = useState<UserProfile | null>(null);

  return (
    <QueryState query={query} loadingLabel="Loading your profile" errorTitle="Couldn't load your profile">
      {(loaded) => {
        const profile = saved ?? loaded;
        return (
          <div className="max-w-xl space-y-4">
            <section className="rounded-md border border-line bg-surface">
              <div className="border-b border-line p-4">
                <ProfileSummary profile={profile} />
              </div>
              <div className="p-4">
                {/* A new key resets the form to the saved values, so Save turns off again. */}
                <ProfileForm key={`${profile.name}|${profile.phone ?? ''}`} profile={profile} onSaved={setSaved} />
              </div>
            </section>
            <ProfileSection title="Change email" description="This is the email you use to log in.">
              <ChangeEmailForm onChanged={(email) => setSaved({ ...profile, email })} />
            </ProfileSection>
            <ProfileSection title="Change password" description="Use a password you don't use anywhere else.">
              <ChangePasswordForm />
            </ProfileSection>
          </div>
        );
      }}
    </QueryState>
  );
}
