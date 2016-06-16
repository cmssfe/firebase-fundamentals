(function () {
    // Config
    var timelinePageCount = 3;

    // Templating functions
    var setUsers = function (users) {
        console.info('called setUsers with these users:', users);
        $('#user-select').html(_.template($('#user-select-template').html())({
            users: users
        })).find('select').on('change', handleUserChange).val(Object.keys(users)[0]).trigger('change');

    },
        setTimeline = function (timeline, userKey, buttons, callback) {
            console.info('called setTimeline with this timeline:', timeline);
            $('#user-timeline').html(_.template($('#user-timeline-template').html())({
                timeline: timeline,
                userKey: userKey,
                loadMore: buttons ? buttons.loadMore || false : false,
                orderByText: buttons ? buttons.orderByText || false : false,
                reset: buttons ? buttons.reset || false : false
            }));

            if (typeof callback === 'function') {
                callback();
            }
        },
        setFollowing = function (following) {
            console.info('called setFollowing with this following:', following);
            var followedUsers = [];
            for (var userId in following) {
                usersRef.child(userId).once('value', function (snap) {
                    followedUsers.push(snap.val());

                    $("#user-following").html(_.template($('#user-following-template').html())({
                        following: followedUsers
                    }));

                });
            }

            $("#user-following").html(_.template($('#user-following-template').html())({
                following: followedUsers
            }));
        },
        setTweetBox = function (user) {
            console.info('called setTweetBox with this user:', user);
            $('#user-tweet-box').html(_.template($('#user-tweet-box-template').html())({
                user: user
            })).find('textarea').on('keyup', function (e) {
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
            });
        };
    var firebaseRoot = "https://suisuinian.firebaseio.com/";

    var ref = new Firebase(firebaseRoot);
    ref.onAuth(function (authData) {
        if (!authData) {
            $("#login").show();
            $("#logout").hide();
        } else {
            $("#login").hide();
            $("#logout").show();
            console.log('user has been authentication', authData);
        }
    });

    // ref.authAnonymously(function(err,authData){
    //     console.log('anonymously logged in!',authData);
    // });

    var email = "liminjun88@qq.com";
    var password = "19881216lmj";

    ref.createUser({
        email: email,
        password: password
    }, function (err, userData) {
        console.log('user data', userData);
        ref.authWithPassword({
            email: email,
            password: password
        }, function (err, authData) {
            console.log('user logged in after created');
        });
    });
    $("#login").click(function () {
        twitterLogin();
    });
    $("#logout").click(function () {
        ref.unauth();
    });
    function twitterLogin() {
        ref.authWithOAuthPopup('twitter', function (err, authData) {
            if (err) {
                console.warn('login failed', err);
            } else {
                console.log('logged in with twitter!', authData);
            }
        });
    }



    // ref.authWithPassword({
    //     email: 'v-leeli@hotmail.com',
    //     password: "19881216lmj"
    // }, function (err, authData) {
    //     console.log('anonymously logged in!', authData);
    // });

    

    var usersRef = new Firebase(firebaseRoot + 'users');
    var userObjectsRef = new Firebase(firebaseRoot + "userObjects");

    usersRef.once('value', function (snap) {
        setUsers(snap.val());
    });

    var timelineRef,
        timelineHandler,
        userRef,
        userHandler,
        tweetBoxClickHandler,
        tweetsRef,
        tweetAddedHandler,
        tweetRemovedHandler,
        timelineHandler,
        removeTimelineHander,
        stopListening = function () {
            if (typeof timelineRef === 'object' && typeof timelineHandler) {
                timelineRef.off('value', timelineHandler);
            }

            if (typeof userRef === 'object' && typeof userHandler) {
                userRef.off('value', userHandler);
            }

            if (typeof tweetsRef === 'object' && typeof tweetAddedHandler) {
                tweetsRef.off('child_added', tweetAddedHandler);
            }

            if (typeof timelineRef === 'object' && typeof timelineHandler) {
                timelineRef.off('child_added', timelineHandler);
            }

            if (typeof tweetsRef === 'object' && typeof tweetRemovedHandler) {
                tweetsRef.off('child_removed', tweetRemovedHandler);
            }

            if (typeof timelineRef === 'object' && typeof removeTimelineHander) {
                timelineRef.off('child_removed', removeTimelineHander);
            }

        };
    var flatten = function (tweets) {
        var keys = Object.keys(tweets),
            i = keys.length,
            result = [],
            tweet;
        while (i--) {
            tweet = tweets[keys[i]];
            tweet.key = keys[i];
            result.unshift(tweet);
        }
        return result;
    };


    var handleUserChange = function (e) {
        var userKey = $(e.target).val();

        if (userKey) {

            timelineRef = userObjectsRef.child("timeline").child(userKey)
                .orderByChild('text');

            var timeline = [];
            timelineHandler = timelineRef.on('child_added', function (snap) {
                //setTimeline(flatten(snap.val()).reverse(), userKey);
                timeline.push(snap.val());
                setTimeline(timeline, userKey);
            });

            removeTimelineHander = timelineRef.on('child_removed', function (snap) {
                timeline = timeline.filter(function (item) {
                    return item.tweetKey !== snap.val().tweetKey;
                });

                setTimeline(timeline, userKey);
            });

            userRef = usersRef.child(userKey);
            userHandler = userRef.on('value', function (snap) {
                setTweetBox(snap.val());
            });


            userObjectsRef.child('following').once('value', function (snap) {
                setFollowing(snap.val());
            });

            tweetBoxClickHandler = function (e) {
                e.preventDefault();
                var tweet = {
                    text: userTweetBox.find('textarea').val(),
                    created: Firebase.ServerValue.TIMESTAMP
                };
                userObjectsRef.child('tweets').child(userKey).push(tweet, function (Error) {
                    if (Error) {
                        console.log('error!' + Error);
                    } else {

                        usersRef.child(userKey).child('tweetCount')
                            .transaction(function (i) {
                                return (i || 0) + 1;
                            });
                    }
                });
            };
            var userTweetBox = $('#user-tweet-box');
            userTweetBox.on('click', 'button', tweetBoxClickHandler);

            tweetsRef = userObjectsRef.child("tweets").child(userKey);


            tweetAddedHandler = tweetsRef.on('child_added', function (snap) {

                var tweet = snap.val();
                var tweetRef = snap.ref();

                if (!tweet.fannedOut) {
                    usersRef.child(userKey).once('value', function (snap) {
                        var user = snap.val();
                        var tweetUser = {
                            email: user.email,
                            key: userKey,
                            name: user.name,
                            username: user.username
                        };

                        userObjectsRef.child("followers").child(userKey).child('list')
                            .once('value', function (snap) {
                                var i = snap.numChildren();
                                snap.forEach(function (childSnap) {
                                    var follower = childSnap.val();
                                    tweet.tweetKey = tweetRef.key();
                                    tweet.user = tweetUser;
                                    tweet.userKey = tweetUser.key;

                                    userObjectsRef.child('timeline').child(follower.key).push(tweet, function (errr) {
                                        i -= 1;
                                        if (i <= 0) {
                                            tweetRef.child('fannedOut').set(true);
                                        }
                                    });
                                });
                            });

                    });
                }

            });

            //tweet移除，需要从关注人员的timeline移除该条tweet
            tweetRemovedHandler = tweetsRef.on('child_removed', function (snap) {

                //snap.val() snap.key()//返回Firebase自动为对象生成的key
                var tweetKey = snap.key();

                userObjectsRef.child("followers").child(userKey).child('list')
                    .once('value', function (snap) {

                        snap.forEach(function (followersSnap) {
                            var follower = followersSnap.val();

                            userObjectsRef.child('timeline').child(follower.key)
                                .orderByChild("tweetKey").equalTo(tweetKey).once('value', function (timelineSnap) {
                                    timelineSnap.forEach(function (childSnap) {
                                        childSnap.ref().remove();
                                    });
                                })
                        });
                    });
            });

        } else {
            setTweetBox({});
            setTimeline({});
            setFollowing({});
        }

        $('#user-timeline').on('click', 'button.remove-tweet', function (e) {
            var target = $(e.target);
            var userKey = target.attr('user-key');
            var tweetKey = target.attr('tweet-key');

            userObjectsRef.child('tweets').child(userKey).child(tweetKey)
                .remove(function (err) {
                    if (err) {
                        console.warn("Tweet deletion error,", err);
                    } else {
                        usersRef.child(userKey).child('tweetCount')
                            .transaction(function (i) {
                                return Math.max(0, (i || 0) - 1);
                            });
                    }
                });

        });

    };

})();