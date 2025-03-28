const CACHE_NAME = "pwa-cache-v7";

// Installation du Service Worker
self.addEventListener("install", (event) => {
    console.log("🔹 Installation du Service Worker...");

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log("📥 Mise en cache des fichiers...");

            // Liste des fichiers essentiels à mettre en cache
            const ASSETS_TO_CACHE = [
                "/",
                "/index.html",
                "/manifest.json",
                "/css/main.css",
                "/js/main.js"
            ];

            try {
                await cache.addAll(ASSETS_TO_CACHE);
                console.log("✅ Tous les fichiers essentiels ont été mis en cache !");
            } catch (error) {
                console.error("❌ Erreur lors de la mise en cache :", error);
            }
        })
    );
});

// Activation du Service Worker et suppression des anciens caches
self.addEventListener("activate", (event) => {
    console.log("✅ Service Worker activé !");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log(`🗑️ Suppression du cache obsolète : ${cache}`);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interception des requêtes réseau et récupération depuis le cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => {
            return caches.match("/index.html");
        })
    );
});
