app.service("MainService", [
    "$http",
    "$window",
    "$location",

    function($http, $window, $location) {
        const rootUrl = "api/"

        this.getUser = getUser
        this.errorMessage = false

        async function getUser(login, pass) {
            const res = await $http
                .post("/api-token-auth/", {
                    username: login,
                    password: pass
                })
                .then(res => {
                    if (res.data.two_factor === false) {
                        localStorage.token = res.data.token
                        localStorage.refreshToken = res.data.refresh_token
                        localStorage.tfa = res.data.two_factor
                    } else if (res.data.two_factor === true) {
                        localStorage.encoded = res.data.encoded
                        localStorage.tfa = res.data.two_factor
                        this.errorMessage = false
                    }
                })
                .catch(res => {
                    if (res.status === 400) {
                        this.errorMessage = true
                    }
                })
            if (localStorage.token !== undefined) {
                $http.defaults.headers.common.Authorization =
                    "JWT " + localStorage.token
                const curres = await $http.get("/api/users/")
                localStorage.curres = JSON.stringify(curres.data)
            }
            return res
        }
    }
])

// $http.defaults.headers.common.Authorization =
//     "JWT " + res.data.token
// $http.post("/api/users/", {})
// async function post(url, params) {
//     const resp = await $http.post(url, params)
//     switch (resp.status) {
//         case 401:
//             this.refreshToken()
//             break
//         case 500:
//             openModalBackenFuckUp()
//             break
//     }
//     return resp
// }
// function getProduct(id) {
// return $http.get(`${rootUrl}product/${id}`);
// }
// function getProducts() {
// return $http.get('dataset.json');
// return $http.get(rootUrl + 'products/');
// }
