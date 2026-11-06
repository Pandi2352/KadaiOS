/** Makes user text safe to search with, so it's matched literally and can't be a slow pattern. */
export const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
