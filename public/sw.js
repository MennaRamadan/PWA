var CACHE_STATIC_NAME = 'static-v13'; 
var CACH_DYNAMIC_NAME = 'dynamic-v2'

self.addEventListener('install', function(event){
    event.waitUntill(caches.open(CACHE_STATIC_NAME).then(function(cache){  
        console.log('[Service workers] Precaching files') 
        cache.addAll([
            '/',
            '/index.html',
            '/offline.html',
            '/src/js/app.js',
            '/src/js/feed.js',
            '/src/js/promise.js',
            '/src/js/fetch.js',
            '/src/js/material.min.js',
            '/src/css/app.css',
            '/src/css/feed.css',
            '/src/images/main-image.jpg',
            'https://fonts.googleapis.com/css?family=Roboto:400,700',
            'https://fonts.googleapis.com/icon?family=Material+Icons',
            'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
    }));
});

//clear old caches
self.addEventListener('activate', function(event){
    event.waitUntill(
        caches.keys().then(function(keyList){
            //return this function when all return
            return Promise.all(keyList.map(function(key){
                if(key !== CACHE_STATIC_NAME && key !== CACH_DYNAMIC_NAME){
                    console.log('[Service worker .. removing old case]');
                    return caches.delete(key);
                }
            }))
        })
    )
    return self.clients.claim();
});

//dymanic cache
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.open(CACH_DYNAMIC_NAME)
        .then(function(cache){
            return fetch(event.request)
            .then(function(res){
                cache.put(event.request, res.clone());
                return res;
            })
        })
    );
});


// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         caches.match(event.request).then(function(response){
//             if(response){
//                 //return cached value
//                 return response;
//             }else{
//                 //cont with server request
//                 return fetch(event.request).then(function(res){
//                     caches.open(CACH_DYNAMIC_NAME).then(function(cache){
//                         cache.put(event.request.url, res.clone())
//                         return res;
//                     })
//                 }).catch(function(){
//                     return caches.open(CACHE_STATIC_NAME).then(function(cache){
//                         return cache.match('/offline.html')
//                     })
//                 });
//             }
//         })
//     );
// });


//dymanic cache with network first
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         fetch(event.request)
//         .then(function(res){
//             caches.open(CACH_DYNAMIC_NAME).then(function(cache){
//                 cache.put(event.request.url, res.clone())
//                 return res;
//             })
//         })
//         .catch(function(error){
//             return caches.match(event.request)
//         })
//     );
// });

//cache-only is not the best to use
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         caches.match(event.request)
//     );
// });


//Network-only is not the best to use as this method ignore cache so our app will not work on offline
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         fetch(event.request)
//     );
// });