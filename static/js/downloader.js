const trash = document.querySelector(".trash");
const download = document.querySelector(".download");

trash.style.display = "none";
download.style.display = "none";

// refer to /sw.js for cache name.
const APP_CACHE = caches.open("markdown-scripture-library-v1");

download.addEventListener("click", evt => {
    APP_CACHE.then(cache => {
        cache.add(window.location.pathname);
        trash.style.display = "block";
        download.style.display = "none";
    });
});

trash.addEventListener("click", evt => {
    APP_CACHE.then(cache => {
        const CACHE_KEYS = cache.keys();
        CACHE_KEYS.then(keyList => {
            const itemToDelete = keyList.find(key => key.url === window.location.href);
            cache.delete(itemToDelete);
            trash.style.display = "none";
            download.style.display = "block";
        });
    });
});

APP_CACHE.then(cache => {
    const CACHE_KEYS = cache.keys();
    CACHE_KEYS.then(keyList => {
        const existPageInCache = keyList.find(key => key.url === window.location.href);

        if (existPageInCache) {
            trash.style.display = "block";
        } else {
            download.style.display = "block";
        }
    });
});
