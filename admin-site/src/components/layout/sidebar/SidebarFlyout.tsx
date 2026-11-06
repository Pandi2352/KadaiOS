import { type FocusEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { type DismissReason, useDismiss } from '@kadai/ui';
import type { ModuleDefinition, NavGroupEntry } from '@/types/navigation';
import { SidebarIcon } from './SidebarIcon';
import { navItemClass, sectionTitleClass } from './sidebarStyles';

const CLOSE_DELAY_MS = 120;
const ESTIMATED_PANEL_HEIGHT = 220;

interface SidebarFlyoutProps {
  entry: NavGroupEntry;
  modules: ModuleDefinition[];
  isActive: boolean;
}

/** Portalled to body because the sidebar's scroll area would clip it. */
export function SidebarFlyout({ entry, modules, isActive }: SidebarFlyoutProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const shouldFocusPanel = useRef(false);
  const refs = useMemo(() => [triggerRef, panelRef], []);
  const isOpen = position !== null;

  const open = () => {
    window.clearTimeout(closeTimer.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: Math.max(8, Math.min(rect.top, window.innerHeight - ESTIMATED_PANEL_HEIGHT)),
      left: rect.right,
    });
  };

  const close = useCallback(() => setPosition(null), []);

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(close, CLOSE_DELAY_MS);
  };

  const handleDismiss = useCallback(
    (reason: DismissReason) => {
      close();
      if (reason === 'escape') triggerRef.current?.focus();
    },
    [close],
  );

  useDismiss(refs, handleDismiss, isOpen);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (isOpen && shouldFocusPanel.current) {
      shouldFocusPanel.current = false;
      panelRef.current?.querySelector('a')?.focus();
    }
  }, [isOpen]);

  // Clicking or pressing Enter moves focus in, so keyboard users can reach the portalled links.
  const handleTriggerClick = () => {
    if (isOpen) {
      panelRef.current?.querySelector('a')?.focus();
      return;
    }
    shouldFocusPanel.current = true;
    open();
  };

  const handlePanelBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !refs.some((ref) => ref.current?.contains(next))) close();
  };

  return (
    <div onMouseEnter={open} onMouseLeave={scheduleClose}>
      <button
        ref={triggerRef}
        type="button"
        title={entry.label}
        aria-label={entry.label}
        aria-expanded={isOpen}
        onClick={handleTriggerClick}
        className={navItemClass({ isActive, isCollapsed: true })}
      >
        <SidebarIcon icon={entry.icon} isActive={isActive} />
      </button>
      {position &&
        createPortal(
          <div ref={panelRef} onBlur={handlePanelBlur} style={position} className="fixed z-50 w-52 pl-2">
            <div className="rounded-md border border-line bg-surface p-1.5">
              <p className={`${sectionTitleClass} pt-1`}>{entry.label}</p>
              <ul className="space-y-0.5">
                {modules.map((module) => (
                  <li key={module.id}>
                    <NavLink to={module.path} end onClick={close} className={navItemClass}>
                      <span className="truncate">{module.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
