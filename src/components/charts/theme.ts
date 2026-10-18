export const chartColors=['#6366f1','#14b8a6','#f59e0b','#f43f5e','#38bdf8','#a78bfa','#84cc16'];
export function subscribeTheme(onChange:()=>void){const observer=new MutationObserver(onChange);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});return ()=>observer.disconnect();}
export const darkTheme=()=>document.documentElement.classList.contains('dark');
