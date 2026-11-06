import type { AuthSession, UserProfile } from '@kadai/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/ApiError';
import type { ApiClient } from '../../api/createApiClient';
import { ToastProvider } from '../../components/toast/ToastContext';
import { AuthProvider, useAuth } from '../AuthProvider';
import { createAuthClient } from '../createAuthClient';
import { ProfileCard } from './ProfileCard';

const USER = { id: '1', name: 'Default Admin', email: 'admin@kadaios.test', role: 'admin' as const };
const SESSION: AuthSession = { accessToken: 't', expiresIn: 900, user: USER };
const PROFILE: UserProfile = { ...USER, phone: '+919000000000', createdAt: '2026-11-06T06:00:00.000Z' };

function NameElsewhere() {
  const { user } = useAuth();
  return <p data-testid="navbar-name">{user?.name}</p>;
}

const setup = async (get: ReturnType<typeof vi.fn>, put = vi.fn()) => {
  const api = {
    post: vi.fn().mockResolvedValue(SESSION),
    get,
    put,
    setAccessToken: vi.fn(),
    setRefreshHandler: vi.fn(),
    setRequestGate: vi.fn(),
  };
  const auth = createAuthClient({ api: api as unknown as ApiClient, role: 'admin' });
  render(
    <AuthProvider auth={auth}>
      <ToastProvider>
        <NameElsewhere />
        <ProfileCard />
      </ToastProvider>
    </AuthProvider>,
  );
  await screen.findByTestId('navbar-name');
  return { put };
};

const nameField = () => screen.findByRole('textbox', { name: 'Name' });
const saveButton = () => screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement;

describe('ProfileCard', () => {
  it('shows the details from the API', async () => {
    await setup(vi.fn().mockResolvedValue(PROFILE));

    expect(((await nameField()) as HTMLInputElement).value).toBe('Default Admin');
    expect(screen.getByRole('heading', { name: 'Default Admin' })).toBeTruthy();
    expect(screen.getByText(/Admin · Joined 6 Nov 2026/)).toBeTruthy();
    expect((screen.getByRole('textbox', { name: /Phone/ }) as HTMLInputElement).value).toBe('+919000000000');
  });

  it('does not let the email be edited', async () => {
    await setup(vi.fn().mockResolvedValue(PROFILE));
    await nameField();
    expect((screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement).disabled).toBe(true);
  });

  it('only allows saving once something has changed', async () => {
    await setup(vi.fn().mockResolvedValue(PROFILE));
    const name = await nameField();
    expect(saveButton().disabled).toBe(true);

    await userEvent.type(name, 'x');
    expect(saveButton().disabled).toBe(false);
  });

  it('saves, updates the name elsewhere, and turns Save off again', async () => {
    const saved = { ...PROFILE, name: 'New Name' };
    const { put } = await setup(vi.fn().mockResolvedValue(PROFILE), vi.fn().mockResolvedValue(saved));
    const name = await nameField();

    await userEvent.clear(name);
    await userEvent.type(name, 'New Name');
    await userEvent.click(saveButton());

    await screen.findByRole('heading', { name: 'New Name' });
    expect(put).toHaveBeenCalledWith('/users/me', { name: 'New Name', phone: '+919000000000' });
    expect(screen.getByTestId('navbar-name').textContent).toBe('New Name');
    expect(saveButton().disabled).toBe(true);
    expect(document.querySelector('[popover] li')?.textContent).toContain('Profile updated');
  });

  it('shows API errors under the field, and keeps what was typed', async () => {
    const error = new ApiError({ statusCode: 400, message: ['Bad phone'], fields: { phone: ['Bad phone'] } });
    await setup(vi.fn().mockResolvedValue(PROFILE), vi.fn().mockRejectedValue(error));
    await nameField();
    const phone = screen.getByRole('textbox', { name: /Phone/ }) as HTMLInputElement;

    await userEvent.clear(phone);
    await userEvent.type(phone, '9000099999');
    await userEvent.click(saveButton());

    await screen.findByText('Bad phone');
    expect(phone.value).toBe('9000099999');
    expect(document.querySelector('[popover] li')).toBeNull();
  });

  it('shows validation errors without calling the API', async () => {
    const { put } = await setup(vi.fn().mockResolvedValue(PROFILE));
    const phone = await screen.findByRole('textbox', { name: /Phone/ });

    await userEvent.clear(phone);
    await userEvent.type(phone, 'nope');
    await userEvent.click(saveButton());

    await screen.findByText('Phone must have 10 to 15 digits');
    expect(put).not.toHaveBeenCalled();
  });

  const passwordInput = (label: RegExp) => screen.getByLabelText(label, { selector: 'input' });

  it('changes the password, keeps the login and empties the form', async () => {
    const { put } = await setup(vi.fn().mockResolvedValue(PROFILE), vi.fn().mockResolvedValue(SESSION));
    await nameField();

    await userEvent.type(passwordInput(/^New password/), 'another-long-password');
    await userEvent.type(passwordInput(/^Confirm new password/), 'another-long-password');
    const [, current] = screen.getAllByLabelText(/^Current password/, { selector: 'input' });
    await userEvent.type(current, 'old-password');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));

    await screen.findByText('Password changed');
    expect(put).toHaveBeenCalledWith('/users/me/password', {
      currentPassword: 'old-password',
      newPassword: 'another-long-password',
    });
    expect((current as HTMLInputElement).value).toBe('');
    expect(screen.getByTestId('navbar-name').textContent).toBe('Default Admin');
  });

  it('does not send a new password that was typed differently', async () => {
    const { put } = await setup(vi.fn().mockResolvedValue(PROFILE));
    await nameField();

    await userEvent.type(passwordInput(/^New password/), 'another-long-password');
    await userEvent.type(passwordInput(/^Confirm new password/), 'something-else');
    const [, current] = screen.getAllByLabelText(/^Current password/, { selector: 'input' });
    await userEvent.type(current, 'old-password');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));

    await screen.findByText('Passwords must match');
    expect(put).not.toHaveBeenCalled();
  });

  it('shows a wrong current password under its field', async () => {
    const message = 'Current password is incorrect';
    const error = new ApiError({ statusCode: 400, message, fields: { currentPassword: [message] } });
    await setup(vi.fn().mockResolvedValue(PROFILE), vi.fn().mockRejectedValue(error));
    await nameField();

    await userEvent.type(screen.getByRole('textbox', { name: /^New email/ }), 'new@kadaios.test');
    const [current] = screen.getAllByLabelText(/^Current password/, { selector: 'input' });
    await userEvent.type(current, 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Change email' }));

    await screen.findByText(message);
    expect(current.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows the new email everywhere once it is changed', async () => {
    const session = { ...SESSION, user: { ...USER, email: 'new@kadaios.test' } };
    const { put } = await setup(vi.fn().mockResolvedValue(PROFILE), vi.fn().mockResolvedValue(session));
    await nameField();

    await userEvent.type(screen.getByRole('textbox', { name: /^New email/ }), 'new@kadaios.test');
    const [current] = screen.getAllByLabelText(/^Current password/, { selector: 'input' });
    await userEvent.type(current, 'my-password');
    await userEvent.click(screen.getByRole('button', { name: 'Change email' }));

    await screen.findByText('Email changed');
    expect(put).toHaveBeenCalledWith('/users/me/email', { email: 'new@kadaios.test', currentPassword: 'my-password' });
    expect((screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement).value).toBe('new@kadaios.test');
    expect((screen.getByRole('textbox', { name: /^New email/ }) as HTMLInputElement).value).toBe('');
  });

  it('offers a retry when loading fails', async () => {
    const get = vi
      .fn()
      .mockRejectedValueOnce(new ApiError({ statusCode: 0, message: 'Offline' }))
      .mockResolvedValueOnce(PROFILE);
    await setup(get);

    await screen.findByText("Couldn't load your profile");
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await nameField()).toBeTruthy();
  });
});
