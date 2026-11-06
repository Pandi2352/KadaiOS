import { getErrorMessage, iconButtonClass, useAuth, useToast } from '@kadai/ui';
import { SignOutIcon, UserCircleIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '@/components/ui/Dropdown';
import { MenuButton, MenuLink, MenuNote } from '@/components/ui/MenuItem';
import { MODULES } from '@/config/modules';
import { SITE } from '@/config/site';

/** Only shown inside the protected layout, so there is always a logged-in user. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { setup, staff } = MODULES;

  const handleLogout = async () => {
    try {
      await logout();
      navigate(SITE.loginPath, { replace: true });
    } catch (error) {
      showToast(`Couldn't log out. ${getErrorMessage(error)}`, 'error');
    }
  };

  return (
    <Dropdown label="Account" triggerClassName={iconButtonClass()} trigger={<UserCircleIcon size={18} aria-hidden />}>
      {user && <MenuNote title={user.name}>{user.email}</MenuNote>}
      <MenuLink to={setup.path} icon={setup.icon}>
        {setup.label}
      </MenuLink>
      <MenuLink to={staff.path} icon={staff.icon}>
        {staff.label}
      </MenuLink>
      <MenuButton icon={SignOutIcon} onClick={handleLogout}>
        Log out
      </MenuButton>
    </Dropdown>
  );
}
