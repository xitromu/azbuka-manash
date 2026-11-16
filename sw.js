const PAGE = 'azbuka-manash-page-1';
const ASSETS = ['index.html', 'img/manash.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(PAGE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  const isPage = e.request.mode === 'navigate';
  const isAsset = ASSETS.some(p => new URL(p, self.location).pathname === url.pathname);
  if (!isPage && !isAsset) return;
  e.respondWith((async () => {
    const cache = await caches.open(PAGE);
    try {
      const response = await fetch(e.request);
      if (response.ok) await cache.put(e.request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      if (cached) return cached;
      if (url.pathname.endsWith('/')) return await cache.match(new URL('index.html', url).href, { ignoreSearch: true }) || Response.error();
      if (isPage) return await cache.match(new URL('index.html', self.location).href, { ignoreSearch: true }) || Response.error();
      return Response.error();
    }
  })());
});
