import { Bell } from 'lucide-react';
import { iconButtonClass } from '@kadai/ui';
import { Dropdown } from '@/components/ui/Dropdown';
import { MenuNote } from '@/components/ui/MenuItem';

export function NotificationsMenu() {
  return (
    <Dropdown label="Notifications" triggerClassName={iconButtonClass()} trigger={<Bell size={18} aria-hidden />}>
      <MenuNote title="No notifications">Low stock and expiry alerts will appear here.</MenuNote>
    </Dropdown>
  );
}
