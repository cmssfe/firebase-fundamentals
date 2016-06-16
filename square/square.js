angular.module('app').component('square', {
    templateUrl: "/square/square.html",
    bindings: {
        tweets: "=",
        users: "="
    },
    controller: function () {
        var ctrl=this;
    }
});