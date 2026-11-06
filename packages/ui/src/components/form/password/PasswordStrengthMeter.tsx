import { cn } from '../../../cn';
import { getPasswordStrength } from './passwordStrength';

const SEGMENTS = [1, 2, 3, 4];
const FILL = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-brand', 'bg-success'];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = getPasswordStrength(password);

  return (
    <div className="mt-2 flex items-center gap-2">
      <div aria-hidden className="flex flex-1 gap-1">
        {SEGMENTS.map((segment) => (
          <span
            key={segment}
            className={cn(
              'h-1 flex-1 rounded-md transition-colors',
              segment <= Math.max(score, 1) ? FILL[score] : 'bg-line',
            )}
          />
        ))}
      </div>
      <p aria-live="polite" className="w-16 shrink-0 text-right text-xs text-muted">
        <span className="sr-only">Password strength: </span>
        {label}
      </p>
    </div>
  );
}
