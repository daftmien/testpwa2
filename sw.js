
// Nom du cache
const CACHE_NAME = "pwa-cache-v5";

// Fichiers à mettre en cache
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/view.0.0.86.css",
    "/css/main.5a6c52f7.css",
    "/css/css.css",
    "/css/css_1.css",
    "/css/css_2.css",
    "/css/css_3.css",
    "/css/css_4.css",
    "/css/css2.css",
    "/audio/sample.mp3" // Ajoute ici tous les fichiers audio nécessaires
];

// Installation du service worker et mise en cache des fichiers
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activation et suppression des anciens caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interception des requêtes et réponse avec le cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.url.startsWith("https://croiselesfingers.netlify.app/audio/")) {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            return caches.match("/index.html");
        })
    );
});
