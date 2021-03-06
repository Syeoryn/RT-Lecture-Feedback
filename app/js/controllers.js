'use strict';

/* Controllers */

angular.module('myApp.controllers', ['myApp.services'])
   .controller('HomeCtrl', ['$scope', '$firebase', 'syncData', '$rootScope', function($scope, $firebase, syncData, $rootScope) {
      // access firebase ratings
      var ratings = new Firebase('https://lecturefeedback.firebaseio.com/ratings');
      var aggregate = new Firebase('https://lecturefeedback.firebaseio.com/ratings/aggregate');
      var lecture = new Firebase('https://lecturefeedback.firebaseio.com');
      $scope.users = {};
      // bind firebase data to $scope
      $scope.ratings = $firebase(ratings);
      $scope.aggregate = $firebase(aggregate);
      $scope.lecture = $firebase(lecture);

      // Compile all of the latestRating values into one composite rating
      $scope.updateCompositeRating = function(){
         // Store compositeRating as a user named 'aggregate'
         var newCompositeRating = {user: 'aggregate', rating: 0};

         // Add all of the lastRatings to get the newCompositeRating
         var userCount = 0;
         for( var user in $scope.users ){
            userCount++;
            newCompositeRating.rating += $scope.ratings.$child(user).lastRating.rating;
         }

         // Normalize newCompositeRating based on the number of users logging ratings
         newCompositeRating.rating /= userCount;

         // Send the new rating to be saved
         $scope.sendRating(newCompositeRating);

         // Update compositeRating seen by users
         $scope.compositeRating = newCompositeRating.rating;
      }

      // Update user ratings on submission
      $scope.sendRating = function(rating){
         rating.user = rating.user || $rootScope.uid;
         // Add new user/ update existing user's ratings
         var newRating = {rating: rating.rating, time: Firebase.ServerValue.TIMESTAMP};
         $scope.ratings.$child(rating.user).$add(newRating);

         // Track the last rating given by each user
         var lastRating = newRating;

         $scope.ratings.$child(rating.user).$child('lastRating').$set(lastRating).then(function(){
            // Only add user to users list and updateCompositeRating if
            // user data is updated (rather than aggregate data)
            if(rating.user !== 'aggregate'){
               // Add user to users list
               $scope.users[rating.user] = true;
               $scope.lastRating = rating.rating;
               $scope.updateCompositeRating();
            }
         });

         // Reset form rating
      }
   }])

  .controller('ChatCtrl', ['$scope', 'syncData', function($scope, syncData) {
      $scope.newMessage = null;

      // constrain number of messages by limit into syncData
      // add the array into $scope.messages
      $scope.messages = syncData('messages', 10);

      // add new messages to the list
      $scope.addMessage = function() {
         if( $scope.newMessage ) {
            $scope.messages.$add({text: $scope.newMessage});
            $scope.newMessage = null;
         }
      };
   }])

   .controller('LoginCtrl', ['$scope', 'loginService', '$location', function($scope, loginService, $location) {
      $scope.email = null;
      $scope.pass = null;
      $scope.confirm = null;
      $scope.createMode = false;

      $scope.login = function(cb) {
         $scope.err = null;
         loginService.login();
      };

      $scope.logout = function(cb) {
         $scope.err = null;
         loginService.logout();
      }

      $scope.createAccount = function() {
         $scope.err = null;
         if( assertValidLoginAttempt() ) {
            loginService.createAccount($scope.email, $scope.pass, function(err, user) {
               if( err ) {
                  $scope.err = err? err + '' : null;
               }
               else {
                  // must be logged in before I can write to my profile
                  $scope.login(function() {
                     loginService.createProfile(user.uid, user.email);
                     $location.path('/account');
                  });
               }
            });
         }
      };

      function assertValidLoginAttempt() {
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else if( $scope.pass !== $scope.confirm ) {
            $scope.err = 'Passwords do not match';
         }
         return !$scope.err;
      }
   }])

   .controller('AccountCtrl', ['$scope', 'loginService', 'syncData', '$location', function($scope, loginService, syncData, $location) {
      syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');

      $scope.logout = function() {
         loginService.logout();
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      $scope.reset = function() {
         $scope.err = null;
         $scope.msg = null;
      };

      $scope.updatePassword = function() {
         $scope.reset();
         loginService.changePassword(buildPwdParms());
      };

      function buildPwdParms() {
         return {
            email: $scope.auth.user.email,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirm: $scope.confirm,
            callback: function(err) {
               if( err ) {
                  $scope.err = err;
               }
               else {
                  $scope.oldpass = null;
                  $scope.newpass = null;
                  $scope.confirm = null;
                  $scope.msg = 'Password updated!';
               }
            }
         }
      }

   }]);
