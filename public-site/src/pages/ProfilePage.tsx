import { ProfileCard } from '@kadai/ui';
import { usePageTitle } from '@/hooks/usePageTitle';

export function ProfilePage() {
  usePageTitle('My Profile');

  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8">
      <h1 className="text-xl font-semibold">My Profile</h1>
      <ProfileCard />
    </main>
  );
}
