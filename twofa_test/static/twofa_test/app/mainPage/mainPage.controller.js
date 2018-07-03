app.controller("MainPageCtrl", [
    "$scope",
    "$rootScope",
    "MainService",
    "$http",
    "cssInjector",
    "$window",
    "$location",
    "$mdDialog",
    "$cookies",
    // "$localStorage",
    function(
        $scope,
        $rootScope,
        MainService,
        $http,
        cssInjector,
        $window,
        $location,
        $mdDialog,
        $cookies
        // $localStorage
    ) {
        $scope.userLogin = ""
        $scope.userPassword = ""
        // $scope.storage = $localStorage
        $scope.signIn = signIn
        $scope.service = MainService

        init()

        function init() {
            cssInjector.add(rootStatic + "mainPage/mainPage.css")
        }
        async function signIn() {
            if (!localStorage.token) {
                const res = await MainService.getUser(
                    $scope.userLogin,
                    $scope.userPassword
                )
                if (localStorage.tfa === "false") {
                    cssInjector.removeAll()
                    $window.location.href = "/#/ownroom"
                } else if (
                    localStorage.tfa === "true" &&
                    localStorage.encoded &&
                    !MainService.errorMessage
                ) {
                    $scope.showAdvanced()
                }
            } else {
                $scope.logined = true
            }
        }

        $scope.showAdvanced = function(ev) {
            $mdDialog
                .show({
                    controller: DialogController,
                    templateUrl: rootStatic + "mainPage/dialog.tmpl.html",
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
                .then(
                    function(answer) {
                        $http
                            .post("/api-two_factor-auth/", {
                                encoded: localStorage.encoded,
                                code: answer
                            })
                            .then(res => {
                                if (res.data.non_field_errors) {
                                    alert("Incorrect code")
                                    $scope.showAdvanced()
                                } else {
                                    localStorage.token = res.data.token
                                    localStorage.refreshToken =
                                        res.data.refresh_token

                                    $http.defaults.headers.common.Authorization =
                                        "JWT " + localStorage.token
                                    $http.get("/api/users/").then(ress => {
                                        localStorage.curres = JSON.stringify(
                                            ress.data
                                        )
                                        cssInjector.removeAll()
                                        $window.location.href = "/#/ownroom"
                                    })
                                }
                            })
                    },
                    function() {
                        $window.localStorage.clear()
                        $scope.userLogin = ""
                        $scope.userPassword = ""
                    }
                )
        }
        function DialogController($scope, $mdDialog) {
            $scope.changeCode = function() {
                if ($scope.currentCode.length === 6) {
                    $scope.answer($scope.currentCode)
                }
            }
            $scope.hide = function() {
                $mdDialog.hide()
            }

            $scope.cancel = function() {
                $mdDialog.cancel()
            }

            $scope.answer = function(answer) {
                $mdDialog.hide(answer)
            }
        }
    }
])

// material dialog opt
// $scope.showPrompt = function(ev) {
//     $mdDialog.show({controller: DialogController})
//     function DialogController($scope, $mdDialog) {
//         $scope.keypress = function($event) {}
//         $scope.answer = function(answer) {
//             $mdDialog.hide(answer)
//         }
//     }
//     // Appending dialog to document.body to cover sidenav in docs app
//     var confirm = $mdDialog
//         .prompt()
//         .title("2FA")
//         .textContent("Enter your code from Google Authenticator")
//         .placeholder("Your code")
//         .ariaLabel("Your code")
//         .initialValue("")
//         .targetEvent(ev)
//         .required(true)
//         .cancel("Close")
//         .ok("Submit")

//     $mdDialog.show(confirm).then(
//         function(result) {
//             $http
//                 .post(
//                     "/api-two_factor-auth/",
//                     {
//                         encoded: localStorage.encoded,
//                         code: result
//                     }
//                     // {
//                     //     headers: {
//                     //         xsrfHeaderName: "X-CSRFToken",
//                     //         xsrfCookieName: "csrftoken"
//                     //     }
//                     // }
//                 )
//                 .then(res => {
//                     if (res.data.non_field_errors) {
//                         alert("Incorrect code")
//                         $scope.showPrompt()
//                     } else {
//                         localStorage.token = res.data.token
//                         localStorage.refreshToken =
//                             res.data.refresh_token

//                         $http.defaults.headers.common.Authorization =
//                             "JWT " + localStorage.token
//                         $http.get("/api/users/").then(ress => {
//                             localStorage.curres = JSON.stringify(
//                                 ress.data
//                             )
//                             cssInjector.removeAll()
//                             $window.location.href = "/#/ownroom"
//                         })
//                     }
//                 })
//         },
//         function() {
//             $window.localStorage.clear()
//             $scope.userLogin = ""
//             $scope.userPassword = ""
//         }
//     )
// }