//by default service workers not working with libraries, so to make it point to specific libarary use the following 
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');


var CACHE_STATIC_NAME = 'static-v28'; 
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/promise.js',
    '/src/js/idb.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];



// function trimCache(cacheName, maxItems){
//     caches.open(cacheName).then(function(cache){
//         return cache.keys().then(function(keys){
//             if(keys.length > maxItems){
//                 caches.delete(keys[0]).then(trimCache(cacheName, maxItems))
//             }
//         })
//     })
// }

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
      caches.open(CACHE_STATIC_NAME)
        .then(function (cache) {
          console.log('[Service Worker] Precaching App Shell');
          cache.addAll(STATIC_FILES);
        })
    )
});

//clear old caches
self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(function(keyList){
            //return this function when all return
            return Promise.all(keyList.map(function(key){
                if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
                    console.log('[Service worker .. removing old case]');
                    return caches.delete(key);
                }
            }))
        })
    )
    return self.clients.claim();
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
      console.log('matched ', string);
      cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
      cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
  }

//dymanic cache
self.addEventListener('fetch', function(event){
    var url = 'https://pwaprogram-4dd56-default-rtdb.firebaseio.com/posts';
    if(event.request.url.indexOf(url) > -1) {
        //found this string
        event.respondWith(fetch(event.request)
            .then(function(res){
                // trimCache(CACH_DYNAMIC_NAME, 3); //really aggrisive it may be 10 or 20
                // cache.put(event.request, res.clone());
                //store the response in db
                var clonedRes = res.clone();
                clearAllData('posts', function(){
                    return clonedRes.json();
                })
                .then(function(data){
                    for(var key in data){
                      writeData('posts', data[key]);
                    }
                });
                return res;
            })
        );
    }
    else if(isInArray(event.request.url, STATIC_FILES)){
        event.respondWith(
            caches.match(event.request)
        );
    }
    else{
        event.respondWith(
            //look at the cache first then network
            caches.match(event.request).then(function(response){
                if(response){
                    //return cached value
                    return response;
                }else{
                    //cont with server request
                    return fetch(event.request).then(function(res){
                        caches.open(CACHE_DYNAMIC_NAME).then(function(cache){
                            // trimCache(CACH_DYNAMIC_NAME, 3); //really aggrisive it may be 10 or 20
                            cache.put(event.request.url, res.clone())
                            return res;
                        })
                    }).catch(function(){
                        return caches.open(CACHE_STATIC_NAME).then(function(cache){
                            if(event.request.headers.get('accept').include('text/html')){
                                return cache.match('/offline.html')
                            }
                            else{

                            }
                        })
                    });
                }
            })
        )
    }
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

self.addEventListener('sync', function(event){
    console.log('[Service worker] Background syncing!', event);
    if(event.tag === 'sync-new-post'){
      console.log('Syncing new post');
      event.waitUntil(
        readAllData('sync-posts').then(function(data){
            for(var dt of data) {
                fetch('https://us-central1-pwaprogram-4dd56.cloudfunctions.net/storePostData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                    id: dt.id,
                    Title : dt.Title,
                    Location: dt.Location,
                    image: 'https://firebasestorage.googleapis.com/v0/b/pwaprogram-4dd56.appspot.com/o/CITY-SFO-1.jfif?alt=media&token=f0673f33-3ec7-4765-9127-e0e282d42a9c'
                    })
                }).then(function(res){
                    console.log('Sent data', res);
                    if(res.ok){//200
                        res.json().then(function(resData){
                            deleteItemFromDB('sync-posts', resData.id);
                        })
                    }
                })
                .catch(function(err){
                    console.log('Error while sending data', err)
                })
            }
        })
      )
    }
  })

  self.addEventListener('notificationclick', function(event){
    var notification = event.notification;
    var action = event.action;

    if(action === 'confirm'){//action Id
        notification.close();
    }else{
        console.log(action)
    }
  })
  
  //here we can listen to cancel/ swip notification or clear all notifications
  self.addEventListener('notificationclose', function(event){

  })