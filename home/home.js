angular.module('app').component('home', {
    templateUrl: "/home/home.html",
    bindings: {
        tweets: "=",
        users: "="
    },
    controller: function ($location) {
        var ctrl=this;
    }
});