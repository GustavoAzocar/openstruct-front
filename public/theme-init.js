try {
  const saved = localStorage.getItem('openstruct-theme-v1');
  document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : 'light';
} catch {
  document.documentElement.dataset.theme = 'light';
}
