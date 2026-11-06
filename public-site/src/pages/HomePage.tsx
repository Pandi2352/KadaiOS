import { useAuth } from '@kadai/ui';
import { usePageTitle } from '@/hooks/usePageTitle';

export function HomePage() {
  const { user } = useAuth();
  usePageTitle();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-brand">KadaiOS</h1>
      <p className="mt-3 text-lg">Billing, stock and daily accounts for local meat, crackers and dairy shops.</p>
      <p className="mt-2 text-muted">
        {user
          ? `You're logged in as ${user.email}. Ordering isn't available yet.`
          : "KadaiOS is still being built. You can create an account now, but ordering isn't available yet."}
      </p>
    </main>
  );
}
