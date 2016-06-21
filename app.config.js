angular.module('app').factory('firebaseRef', function () {
    var firebaseRoot = "https://suisuinian.firebaseio.com/";

    var ref = new Firebase(firebaseRoot);

    return {
        getRootRef:function(){
            return ref;
        },
        getTweetsRef:function(){
            return ref.child("userObjects").child("tweets");
        },
        getUsersRef:function(){
            return ref.child("users");
        },
        getUserObjectsRef:function(){
            return ref.child("userObjects");
        },
        getFollowingRef:function(){
            return ref.child("userObjects").child("following");
        }
    }
});