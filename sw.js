const CACHE_NAME = "pwa-cache-v8";

// Liste des fichiers essentiels à mettre en cache
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/main.css",
    "/js/main.js",
    "/favicon.ico" // Ajoute l'icône pour éviter l'erreur 404
];

// Fonction de mise en cache sécurisée
async function cacheAssets(cache, assets) {
    for (const asset of assets) {
        try {
            const response = await fetch(asset, { cache: "no-store" }); // Empêche la mise en cache navigateur
            if (!response.ok) throw new Error(`❌ Échec du chargement : ${asset} (${response.status})`);
            await cache.put(asset, response);
            console.log(`✅ Fichier mis en cache : ${asset}`);
        } catch (error) {
            console.warn(error.message); // Affiche seulement un warning et continue
        }
    }
}

// Installation du Service Worker
self.addEventListener("install", (event) => {
    console.log("🔹 Installation du Service Worker...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📥 Mise en cache des fichiers...");
            return cacheAssets(cache, ASSETS_TO_CACHE);
        })
    );
});

// Activation du Service Worker et suppression des anciens caches
self.addEventListener("activate", (event) => {
    console.log("✅ Service Worker activé !");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => caches.delete(cache))
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
            return caches.match("/index.html"); // Renvoie la page d'accueil en cas d'erreur réseau
        })
    );
});
