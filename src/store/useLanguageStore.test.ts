import { afterEach, describe, expect, it, vi } from 'vitest';
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
describe('saved language preference', () => {
  it('loads the saved language, allows switching, and persists both choices', async () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', { localStorage: { getItem: () => 'fil', setItem } });
    const { useLanguageStore } = await import('./useLanguageStore');
    expect(useLanguageStore.getState().language).toBe('fil');
    await useLanguageStore.getState().setLanguage('en');
    expect(useLanguageStore.getState().language).toBe('en');
    expect(setItem).toHaveBeenLastCalledWith('tindapos-language', 'en');
    await useLanguageStore.getState().setLanguage('fil');
    expect(useLanguageStore.getState().language).toBe('fil');
    expect(setItem).toHaveBeenLastCalledWith('tindapos-language', 'fil');
  });
  it('keeps the latest selection when Filipino is still loading', async () => {
    const { useLanguageStore } = await import('./useLanguageStore');
    const filipino = useLanguageStore.getState().setLanguage('fil');
    await useLanguageStore.getState().setLanguage('en');
    await filipino;
    expect(useLanguageStore.getState().language).toBe('en');
  });
  it('still switches languages when the browser blocks preference storage', async () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('Blocked'); } });
    const { useLanguageStore } = await import('./useLanguageStore');
    await useLanguageStore.getState().setLanguage('fil');
    expect(useLanguageStore.getState().language).toBe('fil');
    expect(useLanguageStore.getState().error).toBe('');
  });
});
