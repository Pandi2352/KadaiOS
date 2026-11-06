import { PlusIcon } from '@phosphor-icons/react';
import { buttonClass } from '@kadai/ui';
import { Dropdown } from '@/components/ui/Dropdown';
import { MenuLink } from '@/components/ui/MenuItem';
import { MODULES } from '@/config/modules';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useCan } from '@/hooks/useCan';
import { getVisibleQuickActions } from '@/lib/navigation';

export function QuickCreateMenu() {
  const { businessType } = useWorkspace();
  const actions = getVisibleQuickActions(businessType, useCan());

  // A read-only role has nothing to create.
  if (actions.length === 0) return null;

  return (
    <Dropdown
      label="Create new"
      triggerClassName={buttonClass('primary', 'responsive')}
      trigger={
        <>
          <PlusIcon weight="bold" size={18} aria-hidden />
          <span className="hidden sm:inline">New</span>
        </>
      }
    >
      {actions.map((action) => (
        <MenuLink key={action.id} to={MODULES[action.module].path} icon={action.icon}>
          {action.label}
        </MenuLink>
      ))}
    </Dropdown>
  );
}
