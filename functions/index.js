const functions = require("firebase-functions");
var admin = require('firebase-admin');
var cors = require('cors')({origin: true}); //to allow cros origin access
 var webPush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwaprogram-4dd56-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pwaprogram-4dd56-default-rtdb.firebaseio.com/'
})

exports.storePostData = functions.https.onRequest(function(request, response) {
  cors(request, response, function(){
      admin.database().ref('posts').push({
          id: request.body.id,
          Title: request.body.Title,
          Location: request.body.Location,
          image: request.body.image
      })
      .then(function(){
          webPush.setVapidDetails('mailto:mennaa.ramadan@gmail.com', 'BDbyvrtT8fElCitNcrBbNPPnLiz3BbVqe1wpEw1vLA8VR6ORYvQk81MFvKlUAtr-0ugzNWt1RGSeeVV_fn6UUsc', 'vPE1sM6wX-YM_6WO9GQ8T0JdmkRjQaUOt_vYI6zGq2I');
          return admin.database().ref('subscriptions').once('value');
   
      }).then(function(subscriptions){
          subscriptions.forEach(function(sub){
                var pushConfig = {
                    endPoint: sub.val().endPoint,
                    keys: {
                        auth: sub.val().keys.auth,
                        p256dh: sub.val().keys.p256dh
                    }
                }
                webPush.sendNotification(pushConfig, JSON.stringify(
                    {
                        Title:'New Post',
                        content: 'New Post Added',
                        openUrl: '/help'
                    }
                )).catch(function(err){
                    console.log(err);
                })
          })
        response.status(201).json({
            message: 'Data Stored',
            id: request.body.id
        })
      })
      .catch(function(error){
          response.status(500).json({
              error: err
          })
      })
  })
});
