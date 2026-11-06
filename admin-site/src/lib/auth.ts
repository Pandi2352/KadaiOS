import { createAuthClient } from '@kadai/ui';
import { api } from '@/lib/api/client';

export const auth = createAuthClient({ api, role: 'admin' });
