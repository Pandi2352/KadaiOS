import { cn, type IconComponent } from '@kadai/ui';
import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';
import { FILL_REMAINING } from './fillStyles';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: IconComponent;
  /** Shown after the label. Hidden while undefined, such as during loading. */
  count?: number;
}

interface TabsProps<T extends string> {
  /** Names the group for screen readers. */
  label: string;
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Shown on the same line as the tabs on wide screens, such as the active tab's filters. */
  actions?: ReactNode;
  /** The active tab's content. */
  children: ReactNode;
}

const NEXT_INDEX: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

/** Underlined tabs. Arrow keys move between them, and Tab goes on to the content. */
export function Tabs<T extends string>({ label, tabs, active, onChange, actions, children }: TabsProps<T>) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const tabId = (tab: T) => `${id}-tab-${tab}`;

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const next = NEXT_INDEX[event.key]?.(index, tabs.length);
    if (next === undefined) return;

    event.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div className={FILL_REMAINING}>
      <div className="flex shrink-0 flex-col gap-x-4 border-b border-line min-[1400px]:flex-row min-[1400px]:items-center">
        <div
          ref={listRef}
          role="tablist"
          aria-label={label}
          className="flex shrink-0 gap-1 overflow-x-auto overflow-y-hidden"
        >
          {tabs.map(({ id: tab, label: tabLabel, icon: Icon, count }, index) => {
            const isActive = tab === active;

            return (
              <button
                key={tab}
                id={tabId(tab)}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(tab)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  // The list scrolls on phones, which would clip an outline drawn outside the tab.
                  'flex h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 font-medium whitespace-nowrap transition-colors focus-visible:-outline-offset-2',
                  isActive ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink',
                )}
              >
                {Icon && <Icon size={18} aria-hidden />}
                {tabLabel}
                {count !== undefined && <span className="font-normal tabular-nums">{count}</span>}
              </button>
            );
          })}
        </div>
        {actions && <div className="min-w-0 flex-1 pb-2 min-[1400px]:pb-0">{actions}</div>}
      </div>
      <div role="tabpanel" aria-labelledby={tabId(active)} className={cn('pt-4', FILL_REMAINING)}>
        {children}
      </div>
    </div>
  );
}
