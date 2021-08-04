//This mean that browser will excute the code if it support serviceworker
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then(function(){
        console.log('Serviceworker registered');
    });
}