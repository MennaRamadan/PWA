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
            body: 'You successfully subscribed to our notification service'
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

function askForNotificationPermission(){
    Notification.requestPermission(function(result){ //open prompt to user to allow notification
        console.log('User result', result);
        if(result !== 'granted'){
            console.log('No notification permission granted!');
        }
        else{
            displayConfirmNotification();
        }
    })
}

if('Notification' in window){
    for(var i = 0; i < enableNotificationsBtns.length ; i++){
        enableNotificationsBtns[i].style.display = 'inline-block';
        enableNotificationsBtns[i].addEventListener('click', askForNotificationPermission)
    }
}