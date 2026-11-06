const hasCode = (error: unknown, code: string) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === code;

/** Turns the failures people actually hit when starting the API into a next step. */
export function describeStartupError(error: unknown): string {
  if (error instanceof Error && error.name === 'MongooseServerSelectionError') {
    return `Could not connect to MongoDB. Check that it is running and that MONGODB_URI in server/.env is correct. (${error.message})`;
  }
  if (hasCode(error, 'EADDRINUSE')) {
    return 'The API port is already in use. Stop the other process, then start the API again.';
  }
  return error instanceof Error ? (error.stack ?? error.message) : String(error);
}
