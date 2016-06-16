angular.module('app').component('logout',{
    controller:function(firebaseRef,$location){
        firebaseRef.getRootRef().unauth();
        $location.path("/login");
    }
});