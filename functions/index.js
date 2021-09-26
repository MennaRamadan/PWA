const functions = require("firebase-functions");
var admin = require('firebase-admin');
var cors = require('cors')({origin: true}); //to allow cros origin access

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
