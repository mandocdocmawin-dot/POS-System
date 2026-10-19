import { useCallback } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { translate } from './translate';
export function useTranslation() {
  const language = useLanguageStore(state => state.language);
  const revision = useLanguageStore(state => state.revision);
  const t = useCallback((text: string, values?: Record<string, string | number>) => translate(text, language === 'fil' && revision === 0 ? 'en' : language, values), [language, revision]);
  return { t, language, locale: language === 'fil' ? 'fil-PH' : 'en-PH' };
}
