import type { ReactNode } from 'react';
import { useTranslation } from './useTranslation';
// Localize interface labels explicitly; never walk or mutate React's DOM.
export function T({ text, children }: { text?: string; children?: ReactNode }) {
  const { t } = useTranslation();
  const value = text ?? children;
  return typeof value === 'string' ? t(value) : value;
}
