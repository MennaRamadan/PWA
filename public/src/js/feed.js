var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function(){
    createPostArea.style.transform = 'translateY(0)';
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


