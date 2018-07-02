"use strict"

var app = angular.module("myApp.mainPage.module", ["ngRoute", "ngMaterial"])

app.config([
    "$routeProvider",
    function($routeProvider) {
        $routeProvider.when("/", {
            templateUrl: "/static/twofa_test/app/mainPage/mainPage.html",
            controller: "MainPageCtrl"
        })
    }
])
