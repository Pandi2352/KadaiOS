import { LoaderCircle } from 'lucide-react';

/** The label says what is loading, so nobody has to guess what they're waiting for. */
export function Loader({ label }: { label: string }) {
  return (
    <p role="status" className="flex items-center justify-center gap-2 p-8 text-muted">
      <LoaderCircle size={18} aria-hidden className="animate-spin" />
      {label}
    </p>
  );
}
