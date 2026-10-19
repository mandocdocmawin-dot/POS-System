import { create } from 'zustand';
import { languageKey, loadLanguage, loadTranslations, type Language } from '../i18n/translate';
const storage = (() => { try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; } })();
let request = 0;
export const useLanguageStore = create<{ language: Language; revision: number; error: string; setLanguage: (language: Language) => Promise<void> }>((set) => ({
  language: loadLanguage(storage),
  revision: 0,
  error: '',
  setLanguage: async language => {
    if (language !== 'en' && language !== 'fil') return;
    const current = ++request;
    try { if (language === 'fil') await loadTranslations(); }
    catch { if (current === request) set({ language: 'en', error: 'Unable to load Filipino. Please try again.' }); return; }
    if (current !== request) return;
    set(state => ({ language, revision: state.revision + 1, error: '' }));
    try { storage?.setItem(languageKey, language); } catch { /* The current session still works when storage is unavailable. */ }
  },
}));
