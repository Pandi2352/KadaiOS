import { cn, type IconComponent } from '@kadai/ui';
import { type KeyboardEvent, type ReactNode, useId, useRef } from 'react';

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
export function Tabs<T extends string>({ label, tabs, active, onChange, children }: TabsProps<T>) {
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
    <div>
      <div ref={listRef} role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
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
                '-mb-px flex h-10 shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 font-medium whitespace-nowrap transition-colors focus-visible:-outline-offset-2',
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
      <div role="tabpanel" aria-labelledby={tabId(active)} className="pt-4">
        {children}
      </div>
    </div>
  );
}
