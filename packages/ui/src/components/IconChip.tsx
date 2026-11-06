import { cn } from '../cn';
import type { IconComponent } from './iconTypes';

interface IconChipProps {
  icon: IconComponent;
  /** For a chip on a solid brand background, such as a selected item. */
  inverted?: boolean;
}

/** A framed icon for rows in popups, so a list of icons lines up neatly. */
export function IconChip({ icon: Icon, inverted = false }: IconChipProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-md border',
        inverted ? 'border-on-brand/30 bg-on-brand/15 text-on-brand' : 'border-popup-line bg-surface text-brand',
      )}
    >
      <Icon size={18} />
    </span>
  );
}
