
angular.module('myApp.service.login', ['firebase', 'myApp.service.firebase'])

   .factory('loginService', ['$rootScope', '$firebaseSimpleLogin', 'firebaseRef', 'profileCreator', '$timeout',
      function($rootScope, $firebaseSimpleLogin, firebaseRef, profileCreator, $timeout) {
         var auth = null;
         return {
            init: function() {
               auth = new Firebase('https://lecturefeedback.firebaseio.com');
               return auth = $firebaseSimpleLogin(auth);
            },

            login: function() {
               assertAuth();
               // Redirect to google login page for log in
               //    (rather than default pop-up)
               auth.$login('google',{preferRedirect: false, scope:'profile'}).then(function(user){$rootScope.uid = user.uid});
            },

            logout: function() {
               assertAuth();
               auth.$logout();
            },

            changePassword: function(opts) {
               assertAuth();
               var cb = opts.callback || function() {};
               if( !opts.oldpass || !opts.newpass ) {
                  $timeout(function(){ cb('Please enter a password'); });
               }
               else if( opts.newpass !== opts.confirm ) {
                  $timeout(function() { cb('Passwords do not match'); });
               }
               else {
                  auth.$changePassword(opts.email, opts.oldpass, opts.newpass).then(function() { cb && cb(null) }, cb);
               }
            },

            createAccount: function(email, pass, callback) {
               assertAuth();
               auth.$createUser(email, pass).then(function(user) { callback && callback(null, user) }, callback);
            },

            createProfile: profileCreator
         };

         function assertAuth() {
            if( auth === null ) { throw new Error('Must call loginService.init() before using its methods'); }
         }
      }])

   .factory('profileCreator', ['firebaseRef', '$timeout', function(firebaseRef, $timeout) {
      return function(id, email, callback) {
         firebaseRef('users/'+id).set({email: email, name: firstPartOfEmail(email)}, function(err) {
            //err && console.error(err);
            if( callback ) {
               $timeout(function() {
                  callback(err);
               })
            }
         });

         function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@'))||'');
         }

         function ucfirst (str) {
            // credits: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
         }
      }
   }]);
