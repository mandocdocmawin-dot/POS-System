import {useThemeStore} from '../store/useThemeStore';
export const themeService={current:()=>useThemeStore.getState().theme,subscribe:(fn:()=>void)=>useThemeStore.subscribe(fn),toggle:()=>useThemeStore.getState().toggle()};
