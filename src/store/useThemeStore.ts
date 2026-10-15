import { create } from 'zustand'
import { persist } from 'zustand/middleware'
type Theme = 'light' | 'dark'
export const useThemeStore = create<{ theme: Theme; toggle: () => void }>()(persist((set) => ({ theme: 'light', toggle: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })) }), { name: 'tindapos-theme' }))
