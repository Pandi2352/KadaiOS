import { CircleUser } from 'lucide-react';
import { iconButtonClass } from '@/components/ui/buttonStyles';
import { Dropdown } from '@/components/ui/Dropdown';
import { MenuLink, MenuNote } from '@/components/ui/MenuItem';
import { MODULES } from '@/config/modules';

export function UserMenu() {
  const { setup, staff } = MODULES;

  return (
    <Dropdown label="Account" triggerClassName={iconButtonClass()} trigger={<CircleUser size={18} aria-hidden />}>
      <MenuNote title="Not signed in">Sign-in arrives in Phase 2.</MenuNote>
      <MenuLink to={setup.path} icon={setup.icon}>
        {setup.label}
      </MenuLink>
      <MenuLink to={staff.path} icon={staff.icon}>
        {staff.label}
      </MenuLink>
    </Dropdown>
  );
}
