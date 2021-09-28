var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleForm = document.querySelector('#title');
var locationForm = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasElem = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');


function intializeMedia(){
  if(!('mediaDevices' in navigator)){
    navigator.mediaDevices = {};
  }

  //browsers don't support it but has its' own implementation 
  //browser that doesnot support the modern syntex
  if(!('getUserMedia' in navigator.mediaDevices)){
    navigator.mediaDevices.getUserMedia = function(constraints){
      var getUserMedia = navigator.webKitGetUserMedia || navigator.mozGetUserMedia; 
      if(!getUserMedia){
        return Promise.reject(new Error('get User media is not implemented'))
      }

      return new Promise(function(resolve, reject){
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }

  //also may take , audio: true plus video
  navigator.mediaDevices.getUserMedia({video: true})
  .then(function(stream){
    videoPlayer.srcObject = stream;
    videoPlayer.style.display = 'block';
  }).catch(function(err){
    //device which has no access to camera
    imagePickerArea.style.display = 'block';
  })
}

captureButton.addEventListener('click', function(event){
  canvasElem.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  var context = canvasElem.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight/ (videoPlayer.videoWidth/ canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(function(track){
    track.stop();
  })
})

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function(){
    createPostArea.style.transform = 'translateY(0)';
    intializeMedia();
  // },1)
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  //unregister service workers file
  // if('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations().then(function(registrations){
  //     for(var i = 0; i < registrations.length ; i++){
  //       registrations[i].unregister();
  //     }
  //   })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElem.style.display = 'none';
  // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


//caching some items while click on button 
function onSaveButtonClicked(event){
  console.log('clicked');
  if('caches' in window){
    caches.open('user-requested').then(function(cache){
      cache.add('https://httpbin.org/get');
      cache.add('/src/images/sf-boat.jpg');
    }) 
  }
}

function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';;
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.textContent = data.Title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.Location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save'; 
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data){
  for (var i = 0; i < data.length ; i++){
    createCard(data[i]);
  }
}

var url = 'https://pwaprogram-4dd56-default-rtdb.firebaseio.com/posts.json';
var networkDataRecived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataRecived = true;
    //to convert from object to array
    var dataArray = [];
    for(var key in data){
      dataArray.push(data[key]);
    }
    console.log('From Web', data)
    updateUI(dataArray);
});


if('indexDB' in window){
  readAllData('posts').then(function(data){
    if(!networkDataRecived){
      console.log('From Cache', data)
      updateUI(data);
    }
  })
}

function sendData(){
  fetch('https://us-central1-pwaprogram-4dd56.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      Title : titleForm.value,
      Location: locationForm.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwaprogram-4dd56.appspot.com/o/CITY-SFO-1.jfif?alt=media&token=f0673f33-3ec7-4765-9127-e0e282d42a9c'
    })
  }).then(function(res){
    console.log('Sent data', res);
    updateUI();
  })
}

form.addEventListener('submit', function(event){
  event.preventDefault();
  if(titleForm.value.trim() === '' || locationForm.value.trim() === ''){
    return;
  }
  closeCreatePostModal();
  if('serviceWorker' in navigator && 'SyncManager' in window){
    navigator.serviceWorker.ready.then(function(sw){
      var post = {
        'id': new Date().toISOString(),
        'Title': titleForm.value,
        'Location': locationForm.value
      }
      writeData('sync-posts', post).then(function(){
        return sw.sync.register('sync-new-post');
      }).then(function(){
        var snackBarContainer = document.querySelector('#confirmation-toast');
        var data = {message: 'Your Post was saved for syncing!'};
        snackBarContainer.MaterialSnackbar.showSnackbar(data); 
      }).catch(function(error){
        console.log(err);
      })
    })
  }
  //incase of browser doesnot support syncing function
  else{
    sendData();
  }
})


