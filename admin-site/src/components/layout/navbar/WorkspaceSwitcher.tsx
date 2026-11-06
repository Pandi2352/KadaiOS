import { CaretUpDownIcon } from '@phosphor-icons/react';
import { buttonClass } from '@kadai/ui';
import { Dropdown } from '@/components/ui/Dropdown';
import { MenuButton, MenuNote } from '@/components/ui/MenuItem';
import { BUSINESS_TYPES } from '@/config/businessTypes';
import { useWorkspace } from '@/context/WorkspaceContext';

/** Previews each business type until the signed-in shop decides it, after Phases 2 and 3. */
export function WorkspaceSwitcher() {
  const { businessType, setBusinessType } = useWorkspace();
  const current = BUSINESS_TYPES[businessType];
  const CurrentIcon = current.icon;

  return (
    <Dropdown
      label={`Business type: ${current.label}. Change`}
      triggerClassName={buttonClass('outline', 'responsive')}
      trigger={
        <>
          <CurrentIcon size={16} aria-hidden className="shrink-0" />
          <span className="hidden sm:inline">{current.label}</span>
          <CaretUpDownIcon weight="bold" size={14} aria-hidden className="hidden text-muted sm:inline" />
        </>
      }
    >
      <MenuNote title="Preview a business type">
        Shop accounts arrive in Phase 3. Switch to see how the app adapts.
      </MenuNote>
      {Object.values(BUSINESS_TYPES).map((type) => (
        <MenuButton
          key={type.id}
          icon={type.icon}
          isActive={type.id === businessType}
          onClick={() => setBusinessType(type.id)}
        >
          {type.label}
        </MenuButton>
      ))}
    </Dropdown>
  );
}
