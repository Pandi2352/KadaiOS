import { cn, getInitials } from '@kadai/ui';

const SIZES = {
  md: 'size-9 text-xs',
  lg: 'size-12 text-base',
};

interface AvatarProps {
  name: string;
  size?: keyof typeof SIZES;
}

/** A person's initials. Decorative, because their name is always shown beside it. */
export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-brand-soft font-semibold text-brand',
        SIZES[size],
      )}
    >
      {getInitials(name)}
    </span>
  );
}
