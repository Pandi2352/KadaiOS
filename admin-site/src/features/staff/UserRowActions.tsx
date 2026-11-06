import type { UserProfile } from '@kadai/shared';
import { IconChip, iconButtonClass, Tooltip, useDismiss, useFloatingPosition } from '@kadai/ui';
import { DotsThreeVerticalIcon, EyeIcon, PowerIcon, ShieldCheckIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MenuButton } from '@/components/ui/MenuItem';
import { RowActions } from '@/components/ui/RowActions';
import type { UserActions } from './useStaffPermissions';

const MENU_WIDTH = 208;
const MENU_HEIGHT = 190;

interface UserRowActionsProps {
  user: UserProfile;
  allowed: UserActions;
  onViewDetails: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
}

/**
 * The menu uses fixed positioning because the table scrolls, which would
 * otherwise cut it off. It lines up with the right edge of the button.
 */
export function UserRowActions({
  user,
  allowed,
  onViewDetails,
  onChangeRole,
  onToggleStatus,
  onDeleteUser,
}: UserRowActionsProps) {
  const [isOpen, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const refs = useMemo(() => [rootRef], []);
  const { style, update } = useFloatingPosition(triggerRef, isOpen, MENU_HEIGHT);

  useLayoutEffect(() => {
    if (isOpen) update();
  }, [isOpen, update]);

  const handleDismiss = useCallback((reason: string) => {
    setOpen(false);
    if (reason === 'escape') triggerRef.current?.focus();
  }, []);

  useDismiss(refs, handleDismiss, isOpen);

  const isActive = user.isActive !== false;
  const choose = (action: (user: UserProfile) => void) => () => {
    setOpen(false);
    action(user);
  };

  const left = typeof style.left === 'number' ? style.left + Number(style.width) - MENU_WIDTH : undefined;

  return (
    <RowActions>
      <div ref={rootRef}>
        <Tooltip label={`Actions for ${user.name}`} side="left" disabled={isOpen}>
          <button
            ref={triggerRef}
            type="button"
            aria-label={`Actions for ${user.name}`}
            aria-expanded={isOpen}
            className={iconButtonClass()}
            onClick={() => setOpen(!isOpen)}
          >
            <DotsThreeVerticalIcon size={20} aria-hidden weight="bold" />
          </button>
        </Tooltip>
        {isOpen && (
          <div
            style={{ ...style, left, width: MENU_WIDTH, maxHeight: undefined }}
            className="fixed z-30 rounded-md border popup-surface p-1 font-sans"
          >
            <MenuButton icon={EyeIcon} onClick={choose(onViewDetails)}>
              View details
            </MenuButton>
            {allowed.changeRole && (
              <MenuButton icon={ShieldCheckIcon} onClick={choose(onChangeRole)}>
                Change role
              </MenuButton>
            )}
            {allowed.manageAccount && (
              <>
                <MenuButton icon={PowerIcon} onClick={choose(onToggleStatus)}>
                  {isActive ? 'Deactivate' : 'Activate'}
                </MenuButton>
                <div className="my-1 border-t border-popup-line" />
                <button
                  type="button"
                  onClick={choose(onDeleteUser)}
                  className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-danger transition-colors hover:bg-danger-soft"
                >
                  <IconChip icon={TrashIcon} />
                  Delete account
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </RowActions>
  );
}
