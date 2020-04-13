/**
 * for reference
 * https://gohugohq.com/howto/go-offline-with-service-worker/
 * http://www.favicomatic.com/
 */

const VERSION = 1;
const CACHE = "markdown-scripture-library-v" + VERSION;

self.addEventListener("install", evt =>
    evt.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["/", "/css/basic.css", "/js/downloader.js"])))
);

self.addEventListener("fetch", event => {
    event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});

self.addEventListener("activate", evt =>
    evt.waitUntil(caches.keys().then(keyList => Promise.all(keyList.map(key => key !== CACHE && caches.delete(key)))))
);

self.addEventListener("message", event => event.data.action === "skipWaiting" && self.skipWaiting());
