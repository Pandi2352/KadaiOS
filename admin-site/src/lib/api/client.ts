import { createApiClient } from '@kadai/ui';
import { ENV } from '@/config/env';

export const api = createApiClient({ baseUrl: ENV.apiUrl });
