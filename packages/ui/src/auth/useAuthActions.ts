import type { LoginInput } from '@kadai/shared';
import { getErrorMessage } from '../api/ApiError';
import { useToast } from '../components/toast/ToastContext';
import { useAuth } from './AuthProvider';

/** Login and logout with their messages, so every site tells people the same thing. */
export function useAuthActions() {
  const { login, logout } = useAuth();
  const { showToast } = useToast();

  return {
    /** Failed logins throw, so the form can show why under its fields. */
    loginWithToast: async (input: LoginInput) => {
      const user = await login(input);
      showToast(`Welcome back, ${user.name}.`, { title: 'Logged in' });
    },
    /** Resolves true once logged out, so the page can move on. */
    logoutWithToast: async () => {
      try {
        await logout();
        showToast('You have been logged out on this device.', { title: 'Logged out', tone: 'info' });
        return true;
      } catch (error) {
        showToast(getErrorMessage(error), { title: "Couldn't log out", tone: 'error' });
        return false;
      }
    },
  };
}
