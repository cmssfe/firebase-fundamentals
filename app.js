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
                tweets: function ($q, firebaseRef) {
                    var deferred = $q.defer();
                    var allTweets=[];
                    firebaseRef.getUsersRef().on('value', function (snap) {
                        snap.forEach(function (childSnap) {
                            var userKey=childSnap.key();
                          
                            firebaseRef.getTweetsRef().child(userKey).orderByChild("created").on('value', function (snap) {
                                
                                var tweets=snap.val();
                                for(var key in tweets){
        
                                    allTweets.push(tweets[key]);
                                }
                                
                                
                            });
                        });
         
                        deferred.resolve(allTweets);
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
            template: "<home current-auth='$resolve.currentAuth'></home>",
            resolve: {
                currentAuth: function (firebaseRef,$location,$q) {
                    var deferred = $q.defer();
                    var result=firebaseRef.getRootRef().getAuth();
                    debugger;
                    if(result){
                        deferred.resolve(result);
                        
                    }else{
                        $location.path('/login');
                    }
                    return deferred.promise; 
                }
            }
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

