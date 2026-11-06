import type { UserProfile } from '@kadai/shared';
import { useState } from 'react';
import { QueryState } from '../../components/QueryState';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuth } from '../AuthProvider';
import { ProfileForm } from './ProfileForm';
import { ProfileSummary } from './ProfileSummary';

/** The logged-in person's details and edit form. Both websites show this same card. */
export function ProfileCard() {
  const { getProfile } = useAuth();
  const query = useApiQuery((signal) => getProfile(signal), 'profile');
  const [saved, setSaved] = useState<UserProfile | null>(null);

  return (
    <QueryState query={query} loadingLabel="Loading your profile" errorTitle="Couldn't load your profile">
      {(loaded) => {
        const profile = saved ?? loaded;
        return (
          <section className="max-w-xl rounded-md border border-line bg-surface">
            <div className="border-b border-line p-4">
              <ProfileSummary profile={profile} />
            </div>
            <div className="p-4">
              {/* A new key resets the form to the saved values, so Save turns off again. */}
              <ProfileForm key={`${profile.name}|${profile.phone ?? ''}`} profile={profile} onSaved={setSaved} />
            </div>
          </section>
        );
      }}
    </QueryState>
  );
}
