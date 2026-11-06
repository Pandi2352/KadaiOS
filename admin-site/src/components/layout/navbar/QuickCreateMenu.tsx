import { Plus } from 'lucide-react';
import { buttonClass } from '@/components/ui/buttonStyles';
import { Dropdown } from '@/components/ui/Dropdown';
import { MenuLink } from '@/components/ui/MenuItem';
import { MODULES } from '@/config/modules';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getVisibleQuickActions } from '@/lib/navigation';

export function QuickCreateMenu() {
  const { businessType } = useWorkspace();

  return (
    <Dropdown
      label="Create new"
      triggerClassName={buttonClass('primary', 'responsive')}
      trigger={
        <>
          <Plus size={16} aria-hidden />
          <span className="hidden sm:inline">New</span>
        </>
      }
    >
      {getVisibleQuickActions(businessType).map((action) => (
        <MenuLink key={action.id} to={MODULES[action.module].path} icon={action.icon}>
          {action.label}
        </MenuLink>
      ))}
    </Dropdown>
  );
}
