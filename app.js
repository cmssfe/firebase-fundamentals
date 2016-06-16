var app = angular.module('app', ['ngRoute']);

app.run(function ($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function (e, next, prev, err) {
        if (err === "AUTH_REQUIRED") {
            $location.path("/login");
        }
    });
});

app.config(function ($routeProvider) {
    $routeProvider
        .when('/square', {
            template: "<square users='$resolve.users' tweets='$resolve.tweets'></square>",
            resolve: {
                users: function ($q, firebaseRef) {
                    var deferred = $q.defer();
                    firebaseRef.getUsersRef().on('value', function (snap) {
                        deferred.resolve(snap.val());
                    });
                    return deferred.promise;

                },
                tweets: function ($q,firebaseRef) {
                    var deferred = $q.defer();
                    firebaseRef.getTweetsRef().orderByKey().on('value', function (snap) {
                        deferred.resolve(snap.val());
                    });
                    return deferred.promise;
                }
            }
        })
        .when('/userpref', {
            template: "<edit-user-pref user-preferences='$resolve.userPreferences'></edit-user-pref>",
            resolve: {
                userPreferences: function (fbRef, $firebaseObject, auth) {
                    return auth.$requireAuth().then(function () {
                        return $firebaseObject(fbRef.getPreferencesRef()).$loaded();
                    });
                }
            }
        })
        .when('/home', {
            template: "<home></home>"
        })
        .when('/login', {
            template: '<login current-auth="$resolve.currentAuth"></login>',
            resolve: {
                currentAuth: function (firebaseRef) {
                    return firebaseRef.getRootRef().getAuth();
                }
            }
        })
        .when('/logout', {
            template: '<logout></logout>'
        })
        .otherwise('/square');
});

