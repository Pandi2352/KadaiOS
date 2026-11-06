import { type BusinessType, isBusinessType } from '@kadai/shared';
import { type ReactNode, useMemo } from 'react';
import { DEFAULT_BUSINESS_TYPE } from '@/config/businessTypes';
import { usePersistentState } from '@/hooks/usePersistentState';
import { createStrictContext } from '@/lib/createStrictContext';

interface WorkspaceValue {
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
}

const [Provider, useWorkspace] = createStrictContext<WorkspaceValue>('Workspace');

export { useWorkspace };

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [businessType, setBusinessType] = usePersistentState<BusinessType>(
    'kadai.businessType',
    DEFAULT_BUSINESS_TYPE,
    isBusinessType,
  );
  const value = useMemo(() => ({ businessType, setBusinessType }), [businessType, setBusinessType]);

  return <Provider value={value}>{children}</Provider>;
}
