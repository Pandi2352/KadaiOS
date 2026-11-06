import { getErrorMessage, iconButtonClass, useAuth, useToast } from '@kadai/ui';
import { CircleUser, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '@/components/ui/Dropdown';
import { MenuButton, MenuLink, MenuNote } from '@/components/ui/MenuItem';
import { MODULES } from '@/config/modules';
import { SITE } from '@/config/site';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { setup, staff } = MODULES;

  const handleLogout = async () => {
    try {
      await logout();
      navigate(SITE.loginPath);
    } catch (error) {
      showToast(`Couldn't log out. ${getErrorMessage(error)}`, 'error');
    }
  };

  return (
    <Dropdown label="Account" triggerClassName={iconButtonClass()} trigger={<CircleUser size={18} aria-hidden />}>
      {user ? (
        <MenuNote title={user.name}>{user.email}</MenuNote>
      ) : (
        <MenuNote title="Not logged in">Log in to use your account.</MenuNote>
      )}
      <MenuLink to={setup.path} icon={setup.icon}>
        {setup.label}
      </MenuLink>
      <MenuLink to={staff.path} icon={staff.icon}>
        {staff.label}
      </MenuLink>
      {user ? (
        <MenuButton icon={LogOut} onClick={handleLogout}>
          Log out
        </MenuButton>
      ) : (
        <MenuLink to={SITE.loginPath} icon={LogIn}>
          Log in
        </MenuLink>
      )}
    </Dropdown>
  );
}
