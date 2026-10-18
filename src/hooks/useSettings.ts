import { useSettingsStore } from '../store/useSettingsStore';
import type { Settings } from '../types/settings';
export function useSettings<T>(selector: (settings: Settings) => T): T { return useSettingsStore(state => selector(state.settings)); }
