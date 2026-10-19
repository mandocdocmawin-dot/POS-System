import { beforeAll, describe, expect, it } from 'vitest';
import { languageKey, loadLanguage, loadTranslations, parseLanguage, translate } from './translate';

beforeAll(loadTranslations);
describe('English and Filipino UI copy', () => {
  it('keeps English copy unchanged and translates known interface labels', () => {
    expect(translate('Total Orders', 'en')).toBe('Total Orders');
    expect(translate('Total Orders', 'fil')).toBe('Kabuuang order');
    expect(translate('Sales Trend', 'fil')).toBe('Takbo ng benta');
    expect(translate('partially_refunded', 'fil')).toBe('bahagyang na-refund');
  });
  it('preserves whitespace and supports variables without altering their values', () => {
    expect(translate(' Save ', 'fil')).toBe(' I-save ');
    expect(translate('\n  Save   changes\n', 'fil')).toBe('\n  I-save ang mga pagbabago\n');
    expect(translate('Search {caption}…', 'fil', { caption: 'TP-001 $&' })).toBe('Maghanap sa TP-001 $&…');
    expect(translate('Show {title}', 'fil', { title: 'Mga bagong order' })).toBe('Ipakita ang Mga bagong order');
  });
  it('leaves unknown business data and missing dictionary entries intact', () => {
    for (const value of ['Maria Santos', 'Milo 24g', 'TP-000001', '₱1,234.50', 'constructor', 'Unknown custom category']) {
      expect(translate(value, 'fil')).toBe(value);
    }
    expect(translate('Show {title}', 'fil')).toBe('Ipakita ang {title}');
  });
  it('accepts only supported saved languages and survives unavailable storage', () => {
    expect(parseLanguage('Filipino')).toBe('fil');
    expect(parseLanguage('fil')).toBe('fil');
    expect(parseLanguage('en')).toBe('en');
    expect(parseLanguage('invalid')).toBe('en');
    expect(loadLanguage({ getItem: key => key === languageKey ? 'fil' : null })).toBe('fil');
    expect(loadLanguage({ getItem: () => { throw new Error('Storage blocked'); } })).toBe('en');
    expect(loadLanguage()).toBe('en');
  });
});
