import type { ReactNode } from 'react';
import { useCan } from '@/hooks/useCan';
import { canOpenModule } from '@/lib/navigation';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import type { ModuleDefinition } from '@/types/navigation';

/** For someone who types the address of a page their role can't open. */
export function RequireModuleAccess({ module, children }: { module: ModuleDefinition; children: ReactNode }) {
  const can = useCan();
  return canOpenModule(module, can) ? children : <ForbiddenPage />;
}
