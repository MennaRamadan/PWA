var dbPromise = idb.open('posts-store', 1, function(db){
    if(!db.objectStoreNames.contains('posts')){ 
        db.createObjectStore('posts', {keyPath: 'id'})
    }
    if(!db.objectStoreNames.contains('sync-posts')){ 
        db.createObjectStore('sync-posts', {keyPath: 'id'})
    }
}) //open a new database


function writeData(stName, data){
    return dbPromise.then(function(db){
        var tx = db.transaction(stName, 'readwrite');
        var store = tx.objectStore(stName);
        store.put(data);
        return tx.complete;
    });
}

function readAllData(stName){
    return dbPromise.then(function(db){
        var tx = db.transaction(stName, 'readonly');
        var store = tx.objectStore(stName);
        return store.getAll();
    })
}

function clearAllData(stName){
    return dbPromise.then(function(db){
        var tx = db.transaction(stName, 'readwrite');
        var store = tx.objectStore(stName);
        store.clear();
        return tx.complete;
    })
}


function deleteItemFromDB(stName, id){
    dbPromise.then(function(db){
        var tx = db.transaction(stName, 'readwrite');
        var store = tx.objectStore(stName);
        store.delete(id);
        return tx.complete;
    }).then(function(){
        console.log('item deleted')
    })
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
  
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  }