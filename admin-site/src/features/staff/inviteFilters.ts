import type { AdminInviteListQuery, AdminInviteStatus } from '@kadai/shared';

export type InviteStatusFilter = 'all' | AdminInviteStatus;

export interface InviteFilters {
  search: string;
  status: InviteStatusFilter;
}

export const NO_INVITE_FILTERS: InviteFilters = { search: '', status: 'all' };

export const hasInviteFilters = ({ search, status }: InviteFilters) => search.trim() !== '' || status !== 'all';

export const toInviteQuery = ({ search, status }: InviteFilters): AdminInviteListQuery => ({
  search: search.trim() || undefined,
  status: status === 'all' ? undefined : status,
});
