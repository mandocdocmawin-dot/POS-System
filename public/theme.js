// Apply the saved local theme before the first paint. Recovery validates stored data later.
try {
  const theme = JSON.parse(localStorage.getItem('tindapos-theme') || 'null')?.state?.theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
} catch { /* Preserve corrupt raw state for the recovery screen. */ }
