"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkfrontend_pong"] = self["webpackChunkfrontend_pong"] || []).push([["src_views_friendProfile_js"],{

/***/ "./src/components/profile/FriendMatchHistory.js":
/*!******************************************************!*\
  !*** ./src/components/profile/FriendMatchHistory.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FriendMatchHistory)\n/* harmony export */ });\n/* harmony import */ var _library_component_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../library/component.js */ \"./src/library/component.js\");\n\n\nclass FriendMatchHistory extends _library_component_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor() {\n        super({ element: document.getElementById(\"friendMatchHistory\") });\n        this.friendUsername = null;\n    }\n\n    setFriendUsername(username) {\n        this.friendUsername = username;\n        this.render();\n    }\n\n    async render() {\n        if (!this.friendUsername) {\n            console.error(\"Friend username not set\");\n            return;\n        }\n\n        try {\n            const jwt = localStorage.getItem(\"jwt\");\n            const apiurl = {\"API_URL\":\"/backend\",\"CLIENT_ID\":\"u-s4t2ud-cf4fcea477189ac2857788e8e11ca8f41435f79c2ca10e75f6b03cd61c14e966\",\"CLIENT_SECRET\":\"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\",\"REDIRECT_URI\":\"https://pong.ch/oauthcallback\",\"AUTHORIZATION_URL\":\"https://api.intra.42.fr/oauth/authorize\",\"TOKEN_URL\":\"/api/oauth/token\"}.API_URL;\n            const response = await fetch(`${apiurl}/history_getGames`, {\n                method: \"GET\",\n                headers: {\n                    Authorization: `Bearer ${jwt}`,\n                    \"Content-Type\": \"application/json\",\n                },\n            });\n\n            if (!response.ok) {\n                throw new Error('Failed to fetch game history');\n            }\n\n            const data = await response.json();\n\n            const friendGames = data.historique.filter(game => \n                game.joueur1_username === this.friendUsername || game.joueur2_username === this.friendUsername\n            );\n\n            const gamesHtml = friendGames.map(game => this.createMatch(game)).join('');\n\n            const view = /*html*/ `\n            <div class=\"card p-3 flex-grow-1 d-flex flex-column\">\n                <div class=\"card-content flex-grow-1 d-flex flex-column\">\n                    <div class=\"card-body p-0 flex-grow-1 d-flex flex-column justify-content-between\">\n                        <div class=\"my-1\"></div>\n                        ${gamesHtml}\n                        <div class=\"my-1\"></div>\n                    </div>\n                </div>\n            </div>\n            `;\n\n            this.element.innerHTML = view;\n        } catch (error) {\n            console.error(\"Error fetching friend match history:\", error);\n            this.element.innerHTML = \"<p>Error loading friend match history</p>\";\n        }\n    }\n\n    createMatch(game) {\n        const isFriendWinner = game.gagnant_username === this.friendUsername;\n        const result = isFriendWinner ? \"Victory\" : \"Defeat\";\n        const score = `${game.score_joueur1}-${game.score_joueur2}`;\n        return `\n        <div class=\"d-flex justify-content-between align-items-center my-3\">\n            <div class=\"d-flex flex-column align-items-center\">\n                <img src=\"https://via.placeholder.com/60\" alt=\"Profile\" class=\"img-fluid rounded-circle mb-1\">\n            </div>\n            <div class=\"text-center\">\n                <h6 class=\"mb-0\">${result}</h6>\n                <p class=\"mb-0\">${score}</p>\n                <small class=\"text-muted\">${new Date(game.date_partie).toLocaleString()}</small>\n            </div>\n            <img src=\"https://via.placeholder.com/60\" alt=\"Second Image\" class=\"img-fluid rounded-circle\">\n        </div>\n        <div class=\"border-top my-3\"></div>\n        `;\n    }\n}\n\n//# sourceURL=webpack://frontend-pong/./src/components/profile/FriendMatchHistory.js?");

/***/ }),

/***/ "./src/views/friendProfile.js":
/*!************************************!*\
  !*** ./src/views/friendProfile.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FriendProfile)\n/* harmony export */ });\n/* harmony import */ var _library_component_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../library/component.js */ \"./src/library/component.js\");\n/* harmony import */ var _components_home_navbar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/home/navbar.js */ \"./src/components/home/navbar.js\");\n/* harmony import */ var _components_profile_FriendMatchHistory_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/profile/FriendMatchHistory.js */ \"./src/components/profile/FriendMatchHistory.js\");\n/* harmony import */ var _components_profile_FriendProfileInfo_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/profile/FriendProfileInfo.js */ \"./src/components/profile/FriendProfileInfo.js\");\n// /src/views/friendProfile.js\n\n\n\n\n\nclass FriendProfile extends _library_component_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor() {\n        super({ element: document.getElementById(\"app\") });\n        this.friendUsername = null;\n        this.components = {\n            navBar: new _components_home_navbar_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](),\n            friendProfileInfo: null,\n            friendMatchHistory: null,\n        };\n    }\n\n    setFriendUsername(username) {\n        this.friendUsername = username;\n        this.render();\n    }\n\n    async render() {\n        if (!this.friendUsername) {\n            console.error(\"Friend username not set\");\n            return;\n        }\n\n        const view = /*html*/ `\n        <div class=\"h-100 d-flex flex-column bg-custom vh-100\">\n            <div class=\"row m-0\">\n                <nav class=\"navbar navbar-expand bg-white shadow-sm w-100 mb-0\" id=\"navBar\"></nav>\n            </div>\n            <div class=\"container-fluid p-0 row flex-fill overflow-hidden m-0\">\n                <div class=\"col-md-4 d-flex flex-column overflow-auto p-0\">\n                    <div id=\"friendProfileInfo\" class=\"m-4\"></div>\n                </div>\n                <div class=\"col-md-8 d-flex flex-column overflow-auto p-0\">\n                    <div id=\"friendMatchHistory\" class=\"flex-grow-1 d-flex flex-column mt-4 me-4 mb-4\"></div>\n                </div>\n            </div>\n        </div>\n        `;\n        \n        this.element.innerHTML = view;\n        this.components.navBar.render();\n\n        // Initialiser les composants après que les éléments sont créés dans le DOM\n        this.components.friendProfileInfo = new _components_profile_FriendProfileInfo_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]();\n        this.components.friendMatchHistory = new _components_profile_FriendMatchHistory_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n\n        this.components.friendProfileInfo.setFriendUsername(this.friendUsername);\n        this.components.friendMatchHistory.setFriendUsername(this.friendUsername);\n    }\n}\n\n//# sourceURL=webpack://frontend-pong/./src/views/friendProfile.js?");

/***/ })

}]);