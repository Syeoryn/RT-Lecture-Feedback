'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',
      ['myApp.config', 'myApp.routes', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers',
         'waitForAuth', 'routeSecurity', 'firebase']
   )

   .run(['loginService', '$rootScope', 'FBURL', function(loginService, $rootScope, FBURL) {
      if( FBURL === 'https://INSTANCE.firebaseio.com' ) {
         // double-check that the app has been configured
         angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
         setTimeout(function() {
            angular.element(document.body).removeClass('hide');
         }, 250);
      }
      else {
         // establish authentication
         $rootScope.auth = loginService.init('/login');
         $rootScope.FBURL = FBURL;
      }
   }]);

// var firebase = new Firebase('https://lecturefeedback.firebaseio.com');
// var scores = new Firebase('https://lecturefeedback.firebaseio.com/ratings');
// scores.on('value',function(snapshot){
//    var ratings = snapshot.val();
//    var compositeRating = 0;
//    for(var user in ratings){
//       compositeRating += ratings[user].lastRating.rating;
//    }
//    firebase.child('composite').push({rating: compositeRating, time: Firebase.ServerValue.TIMESTAMP});
// });
