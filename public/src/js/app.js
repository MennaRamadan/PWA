var deferredPrompt;
var enableNotificationsBtns = document.querySelectorAll('.enable-notifications');

if(!window.Promise){
    window.Promise = Promise
}

//This mean that browser will excute the code if it support serviceworker
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then(function(){
        console.log('Serviceworker registered');
    }).catch(function(err){
        console.log(err)
    });
}

window.addEventListener('beforeinstallprompt', function(event){
    console.log('beforeinstallprompt fired')
    event.preventDefault();
    deferredPrompt = event;
    return false;
})

// var promise = new Promise(function(resolve, reject){
//     setTimeout(function(){
//         // resolve('this is excuted once the timer is done')
//         reject({code: 500, message: "An error occurred"})
//     }, 3000)
// });

//So what to use XML or fetch 
//We will use fetch as  fetch is async which will work with service workers but XML is sync 
// var xhr = XMLHttpRequest();
// xhr.open('GET', 'https://httpbin.org/ip');
// xhr.responseType = 'json';

// xhr.onload = function(){
//     console.log(xhr.response);
// }

// xhr.onerror = function(){
//     console.log('XML Error');
// }

// xhr.send();

//Example how to use fetch to get data
// fetch('https://httpbin.org/ip')
// .then(function(response){
//     console.log(response);
//     //we need to parse the response 
//     return response.json();
// }).then(function(data){
//     console.log(data);
// }).catch(function(error){
//     console.log(error);
// })


//Example how to use fetch to post data
// fetch('https://httpbin.org/post', {
//     method: 'POST',
//     headers: {
//         'Content-Type' : 'application/json',
//         'Accept' : 'application/json',
//     },
//     //this means that the response will include cors headers
//     //we choose the mode to be cors to be able to access the data from javascript
//     mode: 'cors',
//     body: JSON.stringify({
//         message: 'Does this work!'
//     })
// })
// .then(function(response){
//     console.log(response);
//     //we need to parse the response 
//     return response.json();
// }).then(function(data){
//     console.log(data);
// }).catch(function(error){
//     console.log(error);
// })

//For promise resolve
// promise.then(function(text){
//     console.log(text);
// }, function(error){
//     console.log(error.message);
// })

// promise.then(function(text){
//         console.log(text);
// }).catch(function(error){
//     console.log(error.message);
// })
// for promise reject


//callback examples
// setTimeout(function(){
//     console.log('this is excuted once the timer is done')
// }, 3000)
// console.log('This is excuted right after setTimeOut');

function displayConfirmNotification(){
    if('serviceWorker' in navigator){
        var options = {
            body: 'You successfully subscribed to our notification service',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            dir: 'ltr',
            lang: 'en-US', //BCP 47
            vibrate: [100,50,200],
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true, //vibrate in each new application
            actions: [
                {action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
                {action: 'cancle', title: 'Cancle', icon: '/src/images/icons/app-icon-96x96.png'}
            ]
        }
        navigator.serviceWorker.ready.then(function(swReg){//show notification using service workers
            swReg.showNotification('Successfully subscribed (From SW)!', options)
        })
        //handling notifcation from browser
        // var options = {
        //     body: 'You successfully subscribed to our notification service'
        // }
        // new Notification('Successfully subscribed!', options);
    }
}

function configurePushSub(){
    if(!('serviceWorker' in navigator)){
        return;
    }
    var reg;
    navigator.serviceWorker.ready
    .then(function(swReg){
        reg = swReg;
        return swReg.pushManager.getSubscription();
    }).then(function(sub){
        if(sub === null){
            var vapidPublicKey= 'BDbyvrtT8fElCitNcrBbNPPnLiz3BbVqe1wpEw1vLA8VR6ORYvQk81MFvKlUAtr-0ugzNWt1RGSeeVV_fn6UUsc';
            var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
            //create new subscrption
            return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidPublicKey
            })
        }
        else{
            //use exsiting one
        }
    }).then(function(newSub){
        return fetch('https://pwaprogram-4dd56-default-rtdb.firebaseio.com/subscriptions.json',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newSub)
            }
        )
    }).then(function(res){
        if(res.ok){
            displayConfirmNotification();
        }
    }).catch(function(err){
        console.log(err);
    })
}

function askForNotificationPermission(){
    Notification.requestPermission(function(result){ //open prompt to user to allow notification
        console.log('User result', result);
        if(result !== 'granted'){
            console.log('No notification permission granted!');
        }
        else{
            // displayConfirmNotification();
            configurePushSub();
        }
    })
}

if('Notification' in window && 'serviceWorker' in navigator){
    for(var i = 0; i < enableNotificationsBtns.length ; i++){
        enableNotificationsBtns[i].style.display = 'inline-block';
        enableNotificationsBtns[i].addEventListener('click', askForNotificationPermission)
    }
}