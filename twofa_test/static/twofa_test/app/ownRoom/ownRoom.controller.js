app.controller("OwnRoomCtrl", [
    "$scope",
    "$rootScope",
    "MainService",
    "$http",
    "cssInjector",
    "$window",
    "$location",
    "upload",
    "$mdDialog",
    "$cookies",
    function(
        $scope,
        $rootScope,
        MainService,
        $http,
        cssInjector,
        $window,
        $location,
        upload,
        $mdDialog,
        $cookies
    ) {
        init()
        function init() {
            cssInjector.add(rootStatic + "ownRoom/ownRoom.css")
            $http.defaults.headers.common.Authorization =
                "JWT " + localStorage.token
            $http
                .get("/api/users/")
                .then(ress => {
                    localStorage.curres = JSON.stringify(ress.data)
                    $scope.curres = JSON.parse(localStorage.curres)
                    $scope.userNLSArr = $scope.curres.name.split(" ")
                    $scope.userLastName = $scope.userNLSArr[0]
                    $scope.userName = $scope.userNLSArr[1]
                    $scope.userSurname = $scope.userNLSArr[2]
                    // $scope.userPassword = $scope.curres.password
                    $scope.userLogin = $scope.curres.username
                    $scope.userPhoto = $scope.curres.photo
                    $scope.userEmail = $scope.curres.email
                    $scope.tfa = $scope.curres.two_fa_check
                    $scope.emailConf = $scope.curres.need_comfirm
                    // $scope.errorCode = false
                })
                .catch(res => {
                    if (res.status === 401) {
                        $http
                            .post("/api-token-refresh/", {
                                refresh_token: localStorage.refreshToken
                            })
                            .then(res => {
                                localStorage.token = res.data.token
                                $http.defaults.headers.common.Authorization =
                                    "JWT " + localStorage.token
                                $http.get("/api/users/").then(ress => {
                                    localStorage.curres = JSON.stringify(
                                        ress.data
                                    )
                                    $scope.curres = JSON.parse(
                                        localStorage.curres
                                    )
                                    $scope.userNLSArr = $scope.curres.name.split(
                                        " "
                                    )
                                    $scope.userLastName = $scope.userNLSArr[0]
                                    $scope.userName = $scope.userNLSArr[1]
                                    $scope.userSurname = $scope.userNLSArr[2]
                                    // $scope.userPassword = $scope.curres.password
                                    $scope.userLogin = $scope.curres.username
                                    $scope.userPhoto = $scope.curres.photo
                                    $scope.userEmail = $scope.curres.email
                                    $scope.tfa = $scope.curres.two_fa_check
                                    $scope.emailConf =
                                        $scope.curres.need_comfirm
                                    // $scope.errorCode = false
                                })
                            })
                    }
                })
        }
        $scope.logOut = function() {
            $window.localStorage.clear()
            $window.location.href = "/"
        }
        $scope.getCode = function() {
            $http.defaults.headers.common.Authorization =
                "JWT " + localStorage.token
            $http
                .get("/get-qr-for-adding/")
                .then(res => {
                    $scope.codeData = res.data
                    $scope.showAdvanced()
                })
                .catch(res => {
                    if (res.status === 401) {
                        $http
                            .post("/api-token-refresh/", {
                                refresh_token: localStorage.refreshToken
                            })
                            .then(res => {
                                localStorage.token = res.data.token
                                $http.defaults.headers.common.Authorization =
                                    "JWT " + localStorage.token
                                $http.get("/get-qr-for-adding/").then(res => {
                                    $scope.codeData = res.data
                                    $scope.showAdvanced()
                                })
                            })
                    }
                })
        }
        // material dialog opt

        $scope.showAdvanced = function(ev) {
            $mdDialog
                .show({
                    controller: ShowDialogController,
                    templateUrl: rootStatic + "ownRoom/addDialog.tmpl.html",
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        qrCode: $scope.codeData.encoded_qr,
                        textCode: $scope.codeData.secret_key,
                        error: $scope.errorCode
                    },
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
                .then(
                    function(answer) {
                        $scope.emailConf = true
                        $scope.showAlert()
                        // $http.defaults.headers.common.Authorization =
                        //     "JWT " + localStorage.token
                        // $http
                        //     .post("/confirm_factor_activation/", {
                        //         code: answer
                        //     })
                        //     .then(res => {
                        //         if (res.data.code) {
                        //             $scope.errorCode = true
                        //             $scope.showAdvanced()
                        //             // $scope.showErrAlert()
                        //         } else if (res.data.email) {
                        //             $scope.emailConf = true
                        //             $scope.showAlert()
                        //             // $scope.tfa = true
                        //             // $scope.logOut()
                        //         }
                        //     })
                    },
                    function() {}
                )
        }

        function ShowDialogController(
            $scope,
            $mdDialog,
            qrCode,
            textCode,
            error,
            cssInjector
        ) {
            cssInjector.add(rootStatic + "ownRoom/modalAdd.css")
            $scope.qrCode = qrCode
            $scope.textCode = textCode
            $scope.error = error
            $scope.active = true
            $scope.checkBack = function($event) {

                if ($event.keyCode === 8 && $scope.currentCode.length === 4) {
                    $scope.currentCode = $scope.currentCode.substring(0, $scope.currentCode.length - 1)

                }
            }
            $scope.changeCode = function() {
                if ($scope.currentCode.length === 3) {
                    $scope.currentCode = $scope.currentCode + " "
                }
                if ($scope.currentCode.length === 7) {
                    $scope.sendCode = $scope.currentCode.replace(/\s/g, "")

                    $scope.answer($scope.sendCode)
                }
            }
            $scope.hide = function() {
                $mdDialog.hide()
            }

            $scope.cancel = function() {
                $mdDialog.cancel()
            }

            $scope.answer = function(answer) {
                $scope.active = false
                $http.defaults.headers.common.Authorization =
                    "JWT " + localStorage.token
                $http
                    .post("/confirm_factor_activation/", {
                        code: answer
                    })
                    .then(res => {
                        if (res.data.code) {
                            $scope.active = true
                            $scope.error = true
                            // $scope.showAdvanced()

                            // $scope.showErrAlert()
                        } else if (res.data.email) {
                            $scope.active = true
                            $mdDialog.hide()

                            // $scope.tfa = true
                            // $scope.logOut()
                        }
                    })
            }
        }

        $scope.hideAdvanced = function(ev) {
            $mdDialog
                .show({
                    controller: HideDialogController,
                    templateUrl: rootStatic + "ownRoom/removeDialog.tmpl.html",
                    parent: angular.element(document.body),
                    locals: {
                        error: $scope.errorCode
                    },
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
                .then(
                    function(answer) {
                        $scope.emailConf = true
                        $scope.showAlert()
                        // $http.defaults.headers.common.Authorization =
                        //     "JWT " + localStorage.token
                        // $http
                        // .post("/confirm_factor_deactivation/", {
                        //     code: answer
                        // })
                        // .then(res => {
                        //     if (res.data.code) {
                        //         $scope.errorCode = true
                        //         // $scope.showErrAlert()
                        //         $scope.hideAdvanced()
                        //     } else if (res.data.email) {
                        //         $scope.showAlert()
                        //         $scope.emailConf = true
                        //         // $scope.tfa = false
                        //         // $scope.logOut()
                        //     }
                        // })
                        // .catch(res => {
                        //     if (res.status === 401) {
                        //         $http
                        //             .post("/api-token-refresh/", {
                        //                 refresh_token:
                        //                     localStorage.refreshToken
                        //             })
                        //             .then(res => {
                        //                 localStorage.token = res.data.token
                        //                 $scope.hideAdvanced()
                        //             })
                        //     }
                        // })
                    },
                    function() {}
                )
        }

        function HideDialogController($scope, $mdDialog, error, cssInjector) {
            cssInjector.add(rootStatic + "ownRoom/modalAdd.css")
            $scope.error = error
            $scope.active = true
            $scope.checkBack = function($event) {

                if ($event.keyCode === 8 && $scope.currentCode.length === 4) {
                    $scope.currentCode = $scope.currentCode.substring(0, $scope.currentCode.length - 1)

                }
            }
            $scope.changeCode = function() {
                if ($scope.currentCode.length === 3) {
                    $scope.currentCode = $scope.currentCode + " "
                }
                if ($scope.currentCode.length === 7) {
                    $scope.sendCode = $scope.currentCode.replace(/\s/g, "")
                    $scope.answer($scope.sendCode)
                }
            }
            $scope.hide = function() {
                $mdDialog.hide()
            }

            $scope.cancel = function() {
                $mdDialog.cancel()
            }

            $scope.answer = function(answer) {
                $scope.active = false
                $http.defaults.headers.common.Authorization =
                    "JWT " + localStorage.token
                $http
                    .post("/confirm_factor_deactivation/", {
                        code: answer
                    })
                    .then(res => {
                        if (res.data.code) {
                            $scope.active = true
                            $scope.error = true
                            // $scope.showErrAlert()
                            // $scope.hideAdvanced()
                        } else if (res.data.email) {
                            $scope.active = true
                            $mdDialog.hide()
                            // $scope.tfa = false
                            // $scope.logOut()
                        }
                    })
                    .catch(res => {
                        if (res.status === 401) {
                            $http
                                .post("/api-token-refresh/", {
                                    refresh_token: localStorage.refreshToken
                                })
                                .then(res => {
                                    localStorage.token = res.data.token
                                    $scope.hideAdvanced()
                                })
                        }
                    })
                // $mdDialog.hide(answer)
            }
        }

        $scope.showAlert = function(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application
            // to prevent interaction outside of dialog
            $mdDialog.show(
                $mdDialog
                    .alert()
                    .parent(
                        angular.element(
                            document.querySelector("#popupContainer")
                        )
                    )
                    .clickOutsideToClose(true)
                    .title("Info")
                    .textContent("Check your email to confirmation!")
                    .ariaLabel("Alert Dialog")
                    .ok("Ok")
                    .targetEvent(ev)
            )
        }
        // $scope.showErrAlert = function(ev) {
        //     // Appending dialog to document.body to cover sidenav in docs app
        //     // Modal dialogs should fully cover application
        //     // to prevent interaction outside of dialog
        //     $mdDialog.show(
        //         $mdDialog
        //             .alert()
        //             .parent(
        //                 angular.element(
        //                     document.querySelector("#popupContainer")
        //                 )
        //             )
        //             .clickOutsideToClose(true)
        //             .title("Info")
        //             .textContent("Wrong code!")
        //             .ariaLabel("Alert Dialog")
        //             .ok("Ok")
        //             .targetEvent(ev)
        //     )
        // }
    }
])

// upload button
// $scope.doUpload = function() {
//     upload({
//         url: "/upload",
//         method: "POST",
//         data: {
//             anint: 123,
//             aBlob: Blob([1, 2, 3]), // Only works in newer browsers
//             aFile: $scope.myFile // a jqLite type="file" element, upload() will extract all the files from the input and put them into the FormData object before sending.
//         }
//     }).then(
//         function(response) {
//             console.log(response.data) // will output whatever you choose to return from the server on a successful upload
//         },
//         function(response) {
//             console.error(response) //  Will return if status code is above 200 and lower than 300, same as $http
//         }
//     )
// }

// $scope.showPrompt = function(ev) {
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
//             $http.defaults.headers.common.Authorization =
//                 "JWT " + localStorage.token
//             $http
//                 .post("/confirm_factor/", {
//                     code: result
//                 })
//                 .then(res => {
//                     if (res.data.code) {
//                         alert("Wrong auth code!")
//                         $scope.showAdvanced()
//                     } else if (res.data.email) {
//                         alert(
//                             "Now you will be redirected to login page. Check your email to confirmation of shutdown 2fa!"
//                         )
//                         // $scope.logOut()
//                     }
//                 })
//                 .catch(res => {
//                     if (res.status === 401) {
//                         $http
//                             .post("/api-token-refresh/", {
//                                 refresh_token: localStorage.refreshToken
//                             })
//                             .then(res => {
//                                 localStorage.token = res.data.token
//                                 $scope.showPrompt()
//                             })
//                     }
//                 })
//         },
//         function() {}
//     )
// }
