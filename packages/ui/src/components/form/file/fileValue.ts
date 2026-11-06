const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;

export const DEFAULT_MAX_FILE_SIZE = 5 * MEGABYTE;

export function formatBytes(bytes: number): string {
  if (bytes < KILOBYTE) return `${bytes} B`;
  if (bytes < MEGABYTE) return `${Math.round(bytes / KILOBYTE)} KB`;
  return `${Number((bytes / MEGABYTE).toFixed(1))} MB`;
}

/** Works like the file input's accept attribute, which only guides the picker and doesn't cover dropped files. */
export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(',').some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

interface PickOptions {
  accept?: string;
  multiple: boolean;
  maxSize: number;
  maxFiles?: number;
}

const isSameFile = (first: File, second: File) =>
  first.name === second.name && first.size === second.size && first.lastModified === second.lastModified;

/** Adds what's allowed, and returns one message about what wasn't. */
export function pickFiles(
  current: File[],
  incoming: File[],
  { accept, multiple, maxSize, maxFiles }: PickOptions,
): { files: File[]; rejection?: string } {
  const limit = multiple ? (maxFiles ?? Infinity) : 1;
  let files = multiple ? [...current] : [];
  let rejection: string | undefined;

  for (const file of multiple ? incoming : incoming.slice(0, 1)) {
    if (!matchesAccept(file, accept)) {
      rejection = `${file.name} isn't an allowed file type.`;
    } else if (file.size > maxSize) {
      rejection = `${file.name} is too large. The limit is ${formatBytes(maxSize)}.`;
    } else if (files.length >= limit) {
      rejection = `You can add up to ${limit} ${limit === 1 ? 'file' : 'files'}.`;
    } else if (!files.some((existing) => isSameFile(existing, file))) {
      files = [...files, file];
    }
  }

  // A rejected replacement keeps the file that was already chosen.
  return { files: !multiple && files.length === 0 ? current : files, rejection };
}
