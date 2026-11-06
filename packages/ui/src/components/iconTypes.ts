import type { ComponentType } from 'react';

/** Any icon a shared component can show, whichever icon package it comes from. */
export type IconComponent = ComponentType<{
  size?: number | string;
  className?: string;
  'aria-hidden'?: boolean;
}>;
