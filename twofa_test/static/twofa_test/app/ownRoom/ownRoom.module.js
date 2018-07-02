"use strict"

var app = angular.module("myApp.ownRoom.module", [
    "ngRoute",
    "ngMaterial",
    "ngCookies"
])

app.config([
    "$routeProvider",
    function($routeProvider) {
        $routeProvider.when("/ownroom", {
            templateUrl: rootStatic + "ownRoom/ownRoom.html",
            controller: "OwnRoomCtrl"
        })
    }
]).run([
    "$rootScope",
    "$location",
    "$localStorage",
    function($rootScope, $location, $localStorage) {
        $rootScope.$on("$routeChangeStart", function(event, next, current) {
            if (next.templateUrl === rootStatic + "ownRoom/ownRoom.html") {
                if (localStorage.token === undefined) {
                    $location.path("/")
                } else {
                    $location.path("/ownroom")
                }
            }
        })
    }
])
