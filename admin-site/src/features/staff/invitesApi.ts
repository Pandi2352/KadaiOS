import type {
  AcceptAdminInviteInput,
  AdminInvite,
  AuthSession,
  CreateAdminInviteInput,
  UserProfile,
  ValidateAdminInviteResponse,
} from '@kadai/shared';
import { api } from '@/lib/api/client';

export const invitesApi = {
  listInvites: (signal?: AbortSignal) => api.get<AdminInvite[]>('/auth/admin/invites', { signal }),

  listAdmins: (signal?: AbortSignal) => api.get<UserProfile[]>('/auth/admin/invites/admins', { signal }),

  createInvite: (input: CreateAdminInviteInput) => api.post<AdminInvite>('/auth/admin/invites', input),

  resendInvite: (id: string) => api.post<AdminInvite>(`/auth/admin/invites/${id}/resend`),

  revokeInvite: (id: string) => api.delete<{ revoked: boolean }>(`/auth/admin/invites/${id}`),

  validateToken: (token: string, signal?: AbortSignal) =>
    api.get<ValidateAdminInviteResponse>(`/auth/admin/invites/validate?token=${encodeURIComponent(token)}`, { signal }),

  acceptInvite: (input: AcceptAdminInviteInput) => api.post<AuthSession>('/auth/admin/invites/accept', input),
};

