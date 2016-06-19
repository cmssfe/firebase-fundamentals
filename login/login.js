angular.module('app').component('login', {
    templateUrl: "/login/login.html",
    bindings: {
        currentAuth: '='
    },
    controller: function ($scope, firebaseRef, $location) {

        var ctrl = this;

        ctrl.loggedIn = !!ctrl.currentAuth;


        ctrl.googlePlusLogin = function () {

            firebaseRef.getRootRef().authWithOAuthPopup('google', function (error, authData) {
                if (error) {
                    console.warn("Authentication error", error);
                    ctrl.errorMessage = error.code;
                } else {
                    $location.path('/home');
                    $scope.$apply();
                }
            });
        };

        ctrl.twitterLogin = function () {

            firebaseRef.getRootRef().authWithOAuthPopup('twitter', function (error, authData) {
                if (error) {
                    console.warn("Authentication error", error);
                    ctrl.errorMessage = error.code;
                } else {
                    $location.path('/square');
                    $scope.$apply();
                }
            })
        };

        ctrl.fbLogin = function () {
            firebaseRef.getRootRef().authWithOAuthPopup('facebook', function (error, authData) {
                if (error) {
                    console.warn("Authentication error", error);
                    ctrl.errorMessage = error.code;
                } else {
                    $location.path('/home');
                    $scope.$apply();
                }
            })
        };

        ctrl.githubLogin = function () {
            firebaseRef.getRootRef().authWithOAuthPopup('github', function (error, authData) {
                if (error) {
                    console.warn("Authentication error", error);
                    ctrl.errorMessage = error.code;
                } else {
                    var auth = authData[authData.provider];
                    firebaseRef.getUsersRef().child(authData.uid).once('value', function (snapshot) {
                        if (!snapshot.exists()){
                            firebaseRef.getUsersRef().child(authData.uid).set({
                                displayName: auth.displayName,
                                email: auth.email,
                                username: auth.username,
                                tweetCount: 0
                            });
                        }
                    });



                    $location.path('/home');
                    $scope.$apply();
                }
            })
        }


    }
});