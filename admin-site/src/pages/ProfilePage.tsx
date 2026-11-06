import { ProfileCard } from '@kadai/ui';
import { PageHeader } from '@/components/ui/PageHeader';
import { MODULES } from '@/config/modules';

export function ProfilePage() {
  const { label, description } = MODULES.profile;

  return (
    <div className="space-y-4">
      <PageHeader title={label} description={description} />
      <ProfileCard />
    </div>
  );
}
