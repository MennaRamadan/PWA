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