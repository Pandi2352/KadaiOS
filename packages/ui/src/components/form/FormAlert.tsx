/** For errors that don't belong to one field, such as the server being unreachable. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-danger-strong">
      {message}
    </p>
  );
}
