var deferredPrompt;

//This mean that browser will excute the code if it support serviceworker
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then(function(){
        console.log('Serviceworker registered');
    });
}

window.addEventListener('beforeinstallprompt', function(event){
    console.log('beforeinstallprompt fired')
    event.preventDefault();
    deferredPrompt = event;
    return false;
})

var promise = new Promise(function(resolve, reject){
    setTimeout(function(){
        // resolve('this is excuted once the timer is done')
        reject({code: 500, message: "An error occurred"})
    }, 3000)
})

//For promise resolve
// promise.then(function(text){
//     console.log(text);
// }, function(error){
//     console.log(error.message);
// })

promise.then(function(text){
        console.log(text);
}).catch(function(error){
    console.log(error.message);
})
// for promise reject


//callback examples
// setTimeout(function(){
//     console.log('this is excuted once the timer is done')
// }, 3000)
console.log('This is excuted right after setTimeOut');