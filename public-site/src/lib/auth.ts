import { createAuthClient } from '@kadai/ui';
import { api } from '@/lib/api';

export const auth = createAuthClient({ api, role: 'customer' });
