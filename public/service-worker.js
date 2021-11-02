// Service Worker by Jack Loveday

// Setup Cache
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// Array of File to be sent to the Cache
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/styles.css",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
    "/js/index.js",
    "/js/idb.js"
];

// Install Listener
self.addEventListener("install", (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Files pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
})

// Activate Listener
self.addEventListener("activate", (evt) => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Listener
self.addEventListener("fetch", (evt) => {

    // If our request contains a transaction
    if (evt.request.url.includes("/api/transaction")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(evt.request)
                    .then(resData => {
                        // If resData Data is good
                        if (resData.status === 200) {
                            cache.put(evt.request.url, resData.clone());
                        }
                        return resData;
                    })
                    // Catch errors
                    .catch(err => {
                        return cache.match(evt.request);
                    });
            })
        );
        return;
    }

    // When theres no transaction
    evt.respondWith(
        caches
        .open(CACHE_NAME)
        .then(cacheData => {
            return cacheData
                .match(evt.request)
                .then(resData => {
                    return resData || fetch(evt.request);
                });
        })
    )
})