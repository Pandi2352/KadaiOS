import { CheckCircleIcon, InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import type { IconComponent } from '../iconTypes';

export type ToastTone = 'success' | 'error' | 'info';

interface ToneStyle {
  icon: IconComponent;
  chip: string;
  bar: string;
}

export const TOAST_TONES: Record<ToastTone, ToneStyle> = {
  success: { icon: CheckCircleIcon, chip: 'bg-success-soft text-success', bar: 'bg-success' },
  error: { icon: WarningCircleIcon, chip: 'bg-danger-soft text-danger', bar: 'bg-danger' },
  info: { icon: InfoIcon, chip: 'bg-brand-soft text-brand', bar: 'bg-brand' },
};
