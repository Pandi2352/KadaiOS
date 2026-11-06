import { v7, validate } from 'uuid';

/** The only source of IDs in KadaiOS. UUID v7 sorts by creation time. */
export const generateUuid = (): string => v7();

export const isUuid = (value: unknown): value is string => validate(value);
