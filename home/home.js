angular.module('app').component('home', {
    templateUrl: "/home/home.html",
    bindings: {
        currentAuth: "="
    },
    controller: function ($location, firebaseRef,$scope) {
        var ctrl = this;
        ctrl.currentUserName = ctrl.currentAuth[ctrl.currentAuth.provider].displayName;

        ctrl.user = {
            name: ctrl.currentAuth[ctrl.currentAuth.provider].username
        };

        var userKey = ctrl.currentAuth.uid;
        //获取tweetCount
        firebaseRef.getUsersRef().child(userKey).child("tweetCount").on('value',function(snapshot){
            ctrl.tweetCount=snapshot.val();
        });

        ctrl.tweetTextKeyup = function (e) {
            var characterCount = $(e.target).val().length,
                tweetLength = $('#tweet-length'),
                tweetButton = $('#tweet-button');

            tweetLength.text(140 - characterCount);

            if (characterCount <= 140) {
                tweetLength.css('color', 'gray');

                if (characterCount > 0) {
                    tweetButton.removeAttr('disabled');
                }
            } else {
                tweetLength.css('color', 'red');
                tweetButton.attr('disabled', 'disabled');
            }
        }
        //获取关注当前用户的用户列表
        ctrl.followedUsers=[];
        firebaseRef.getFollowingRef().child(userKey).on('value',function(snapshot){
            var following=snapshot.val();
           
            for(var userId in following){
                firebaseRef.getUsersRef().child(userId).once('value',function(snap){
                    ctrl.followedUsers.push(snap.val());
                });
            }
        });
        //添加tweet
        ctrl.addTweet = function () {
            var tweet = {
                text: ctrl.tweetText,
                created: Firebase.ServerValue.TIMESTAMP
            };

            firebaseRef.getUserObjectsRef().child("tweets").child(userKey).push(tweet, function (error) {
                if (error) {
                    console.log('error:' + error);
                } else {
                    firebaseRef.getUsersRef().child(userKey).child("tweetCount").transaction(function (i) {
                        return (i || 0) + 1;
                    });
                }
            });

        }
    }
});