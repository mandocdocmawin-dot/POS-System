export type Language = 'en' | 'fil';
export const languageKey = 'tindapos-language';
let filipino: Record<string, string> = {};
let lookup = new Map<string, string>();
let pending: Promise<void> | undefined;
export function loadTranslations(): Promise<void> {
  return pending ??= import('./filipino').then(module => {
    filipino = module.filipino;
    lookup = new Map(Object.entries(filipino).map(([key, value]) => [key.toLocaleLowerCase('en'), value]));
  }).catch(error => { pending = undefined; throw error; });
}
export function parseLanguage(value: unknown): Language {
  return value === 'fil' || value === 'Filipino' ? 'fil' : 'en';
}
export function loadLanguage(storage?: Pick<Storage, 'getItem'>): Language {
  try { return parseLanguage(storage?.getItem(languageKey)); } catch { return 'en'; }
}
export function translate(text: string, language: Language, values: Record<string, string | number> = {}): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const translated = language === 'fil' ? (Object.hasOwn(filipino, normalized) ? filipino[normalized] : lookup.get(normalized.toLocaleLowerCase('en'))) : undefined;
  const result = translated ? text.replace(normalized, translated) : text;
  // Preserve JSX whitespace, including labels split across lines.
  const spaced = translated && result === text && text.trim() !== normalized ? text.replace(/\S[\s\S]*\S|\S/, translated) : result;
  return spaced.replace(/\{(\w+)\}/g, (token, key: string) => Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token);
}
