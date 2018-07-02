"use strict"
var rootStatic = "/static/twofa_test/app/"
angular
    .module("myApp", [
        "ngRoute",
        "myApp.mainPage.module",
        "myApp.ownRoom.module",
        "ngMaterial",
        "angular.css.injector",
        "lr.upload",
        "ngStorage"
    ])
    .config([
        "$locationProvider",
        "$routeProvider",
        "$httpProvider",
        function($locationProvider, $routeProvider, $httpProvider) {
            // $locationProvider.hashPrefix("!")
            $locationProvider.hashPrefix("")

            // $httpProvider.defaults.xsrfHeaderName = "X-CSRFToken"
            // $httpProvider.defaults.xsrfCookieName = "csrftoken"

            $routeProvider.otherwise({redirectTo: "/"})
        }
    ])
