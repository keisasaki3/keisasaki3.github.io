// 最小のService Worker: 同じオリジンのGETはネット優先、遅いときとオフライン時はキャッシュを返す
const CACHE = 'life-quest-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネットが3秒以内に返らず、キャッシュがあればキャッシュを返す（ネットの取得は続けてキャッシュを更新する）
const NETWORK_WAIT_MS = 3000;

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin || req.headers.has('range')) return;
  const network = fetch(req).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  });
  e.waitUntil(network.catch(() => {}));
  const slow = new Promise((resolve) => setTimeout(resolve, NETWORK_WAIT_MS))
    .then(() => caches.match(req))
    .then((cached) => cached || network);
  e.respondWith(
    Promise.race([network, slow])
      .catch(() => caches.match(req))
  );
});
