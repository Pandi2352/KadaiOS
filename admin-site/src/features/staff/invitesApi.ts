import type {
  AcceptAdminInviteInput,
  AdminInvite,
  AdminInviteListQuery,
  AuthSession,
  CreateAdminInviteInput,
  Paginated,
  StaffListQuery,
  StaffRole,
  UserProfile,
  ValidateAdminInviteResponse,
} from '@kadai/shared';
import { api } from '@/lib/api/client';

export const invitesApi = {
  listInvites: (query: AdminInviteListQuery, signal?: AbortSignal) =>
    api.get<Paginated<AdminInvite>>('/auth/admin/invites', { query, signal }),

  listAdmins: (query: StaffListQuery, signal?: AbortSignal) =>
    api.get<Paginated<UserProfile>>('/auth/admin/invites/admins', { query, signal }),

  createInvite: (input: CreateAdminInviteInput) => api.post<AdminInvite>('/auth/admin/invites', input),

  resendInvite: (id: string) => api.post<AdminInvite>(`/auth/admin/invites/${id}/resend`),

  revokeInvite: (id: string) => api.delete<{ revoked: boolean }>(`/auth/admin/invites/${id}`),

  updateStaffRole: (id: string, staffRole: StaffRole) =>
    api.patch<UserProfile>(`/auth/admin/invites/users/${id}/role`, { staffRole }),

  updateStaffStatus: (id: string, isActive: boolean) =>
    api.patch<UserProfile>(`/auth/admin/invites/users/${id}/status`, { isActive }),

  deleteStaffUser: (id: string) => api.delete<{ deleted: boolean }>(`/auth/admin/invites/users/${id}`),

  validateToken: (token: string, signal?: AbortSignal) =>
    api.get<ValidateAdminInviteResponse>(`/auth/admin/invites/validate?token=${encodeURIComponent(token)}`, { signal }),

  acceptInvite: (input: AcceptAdminInviteInput) => api.post<AuthSession>('/auth/admin/invites/accept', input),
};
