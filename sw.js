const CACHE_NAME = "pwa-cache-v6";

// Fonction pour récupérer dynamiquement tous les fichiers audios
async function fetchAudioFiles() {
    const response = await fetch("/index.html"); // Charge la page principale
    const text = await response.text(); 
    const audioFiles = [...text.matchAll(/src=["']([^"']+\.(mp3|ogg|wav|mpga))["']/g)].map(match => match[1]);
    return audioFiles;
}

// Installation du Service Worker
self.addEventListener("install", async (event) => {
    console.log("🔹 Installation du Service Worker...");

    // Récupération dynamique des fichiers audio
    const audioFiles = await fetchAudioFiles();
    
    const ASSETS_TO_CACHE = [
        "/",
        "/index.html",
        "/manifest.json",
        "/css/main.css",
        "/js/main.js",
        ...audioFiles, // Ajoute automatiquement tous les fichiers audio détectés
    ];

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📥 Mise en cache des fichiers...");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activation : Suppression des anciens caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    console.log("✅ Service Worker activé !");
});

// Interception des requêtes réseau
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
