const CACHE_NAME = "pwa-cache-v4";
const FILES_TO_CACHE = [
    "/", "/index.html", "/manifest.json",
    "/css/view.0.0.86.css", "/css/main.5a6c52f7.css", "/css/css.css",
    "/css/css_1.css", "/css/css_2.css", "/css/css_3.css", "/css/css_4.css", "/css/css2.css"
];

// Installation : Mise en cache des fichiers essentiels
self.addEventListener("install", event => {
    console.log("📥 Installation du Service Worker et pré-cache des fichiers...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Activation : Nettoyage des anciens caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("🗑 Suppression de l'ancien cache :", cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interception des requêtes et mise en cache dynamique
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                return response || fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                        console.log(`✅ Fichier ajouté au cache : ${event.request.url}`);
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            if (event.request.destination === "document" || event.request.mode === "navigate") {
                return caches.match("/index.html");
            } else if (event.request.destination === "image") {
                return caches.match(event.request.url);
            } else if (event.request.destination === "audio") {
                return caches.match(event.request.url);
            }
        })
    );
});

// Vérification après installation pour voir les fichiers réellement en cache
self.addEventListener("message", event => {
    if (event.data && event.data.type === "CHECK_CACHE") {
        caches.open(CACHE_NAME).then(cache => {
            cache.keys().then(keys => {
                console.log("🔍 Fichiers actuellement en cache :", keys.map(request => request.url));
            });
        });
    }
});
