if (window.location.pathname === '/') {
  // Use the same URL as armaduraHomeScreenshot in src/lib/product-media.ts.
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.href = '/assets/armadurastruct-home-0.4.0.webp';
  preload.fetchPriority = 'high';
  document.head.append(preload);
}
