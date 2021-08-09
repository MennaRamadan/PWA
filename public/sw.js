self.addEventListener('install', function(event){
    event.waitUntill(caches.open('static').then(function(cache){
        console.log('[Service workers] Precaching files')
        cache.add('/');
        cache.add('/index.html');
        cache.add('/src/js/app.js');
    }));
});
self.addEventListener('activate', function(event){
    return self.clients.claim();
});
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request).then(function(response){
            if(response){
                //return cached value
                return response;
            }else{
                //cont with server request
                return fetch(event.request);
            }
        })
    );
});

