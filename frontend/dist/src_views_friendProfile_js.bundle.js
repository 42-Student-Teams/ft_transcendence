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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FriendMatchHistory)\n/* harmony export */ });\n/* harmony import */ var _library_component_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../library/component.js */ \"./src/library/component.js\");\n/* harmony import */ var _utils_langPack_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/langPack.js */ \"./src/utils/langPack.js\");\n/* harmony import */ var _store_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../store/index.js */ \"./src/store/index.js\");\n\n\n\n\nclass FriendMatchHistory extends _library_component_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n\tconstructor() {\n\t\tsuper({ element: document.getElementById(\"friendMatchHistory\") });\n\t\tthis.friendUsername = null;\n\t\tthis.matchHistory = [];\n\t\tthis.currentLang = _store_index_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"].state.language;\n\n\t\t_store_index_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"].events.subscribe('stateChange', () => {\n\t\t\tif (this.currentLang !== _store_index_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"].state.language) {\n\t\t\t\tthis.currentLang = _store_index_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"].state.language;\n\t\t\t\tthis.render();\n\t\t\t}\n\t\t});\n\t}\n\n\tsetFriendUsername(username) {\n\t\tthis.friendUsername = username;\n\t\tthis.render();\n\t}\n\n\tasync render() {\n\t\tconst langPack = _utils_langPack_js__WEBPACK_IMPORTED_MODULE_1__.profile[this.currentLang];\n\n\n\n\t\tconst view = /*html*/ `\n            <div class=\"card p-2 m-0\">\n                <div class=\"card-body p-2 m-0\">\n                    <h5 class=\"card-title text-center mt-3 mb-4\">${langPack.matchHistory}</h5>\n                    <div id=\"match-list-display\" class=\"mt-3\"></div>\n                </div>\n            </div>\n            `;\n\t\tthis.element = document.getElementById('friendMatchHistory');\n\t\tthis.element.innerHTML = view;\n\t\tawait this.handleEvent();\n\n\n\t}\n\n\n\tasync handleEvent() {\n\n\t\tconst langPack = _utils_langPack_js__WEBPACK_IMPORTED_MODULE_1__.profile[this.currentLang];\n\t\tif (!this.friendUsername) {\n\t\t\tconsole.error(\"Friend username not set\");\n\t\t\treturn;\n\t\t}\n\n\t\ttry {\n\t\t\tconst jwt = localStorage.getItem(\"jwt\");\n\t\t\tconst apiurl = {\"API_URL\":\"/backend\"}.API_URL;\n\t\t\tconst response = await fetch(`${apiurl}/get_friend_profile?username=${this.friendUsername}`, {\n\t\t\t\tmethod: \"GET\",\n\t\t\t\theaders: {\n\t\t\t\t\tAuthorization: `Bearer ${jwt}`,\n\t\t\t\t\t\"Content-Type\": \"application/json\",\n\t\t\t\t},\n\t\t\t});\n\n\t\t\tif (response.ok) {\n\t\t\t\tconst data = await response.json();\n\t\t\t\tconsole.log(\"Friend history data:\", data);\n\t\t\t\tthis.matchHistory = data.historique.slice(0, 5);\n\t\t\t\tthis.renderMatchHistory();\n\t\t\t}\n\t\t\telse {\n\t\t\t\tconsole.error('Failed to fetch match history');\n\t\t\t\tshowToast(langPack.fetchMatchHistoryFailed, 'danger');\n\t\t\t}\n\n\t\t} catch (error) {\n\t\t\tconsole.error('Error fetching friends match history:', error);\n\t\t\tshowToast(langPack.fetchMatchHistoryError, 'danger');\n\t\t}\n\t}\n\n\tasync renderMatchHistory() {\n\t\tconst langPack = _utils_langPack_js__WEBPACK_IMPORTED_MODULE_1__.profile[this.currentLang];\n\t\tconst matchDisplayElement = document.getElementById(\"match-list-display\");\n\t\tmatchDisplayElement.innerHTML = '';\n\n\t\tif (this.matchHistory.length > 0) {\n\t\t\tthis.matchHistory.forEach((match, index) => {\n\t\t\t\tconst isLastMatch = index === this.matchHistory.length - 1;\n\t\t\t\tconst matchHtml = this.createMatch(match, isLastMatch);\n\t\t\t\tmatchDisplayElement.insertAdjacentHTML('beforeend', matchHtml);\n\t\t\t});\n\t\t} else {\n\t\t\tmatchDisplayElement.innerHTML = `<p class=\"text-center\">${langPack.noMatchesPlayed}</p>`;\n\t\t}\n\t}\n\n\n\tcreateMatch(match, isLastMatch) {\n\t\tconst langPack = _utils_langPack_js__WEBPACK_IMPORTED_MODULE_1__.profile[this.currentLang];\n\t\tconst result = match.gagnant_username === match.joueur1_username ? langPack.victory : langPack.defeat;\n\t\tconst resultClass = result === langPack.victory ? \"text-success\" : \"text-danger\";\n\t\tconst score = `${match.score_joueur1} - ${match.score_joueur2}`;\n\t\tconst date = new Date(match.date_partie).toLocaleString(this.currentLang);\n\n\t\treturn `\n        <div class=\"d-flex justify-content-between align-items-center py-3 ${!isLastMatch ? 'border-bottom' : ''}\">\n            <div class=\"game-history-container d-flex flex-column align-items-center\">\n                <img src=\"${match.joueur1_avatar}\" alt=\"\" class=\" rounded-circle mb-2 img-match-history\">\n                <small class=\"text-muted text-truncate text-center\" >${match.joueur1_username}</small>\n            </div>\n            <div class=\"text-center\">\n                <span class=\"${resultClass} d-block mb-1\">${result}</span>\n                <p class=\"mb-1\">${score}</p>\n                <small class=\"text-muted\">${date}</small>\n            </div>\n            <div class=\"game-history-container d-flex flex-column align-items-center\">\n                <img src=\"${match.joueur2_avatar}\" alt=\"\" class=\"rounded-circle mb-2 img-match-history\">\n                <small class=\"text-muted text-truncate text-center\">${match.joueur2_username}</small>\n            </div>\n        </div>\n        `;\n\t}\n}\n\n//# sourceURL=webpack://frontend-pong/./src/components/profile/FriendMatchHistory.js?");

/***/ }),

/***/ "./src/views/friendProfile.js":
/*!************************************!*\
  !*** ./src/views/friendProfile.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FriendProfile)\n/* harmony export */ });\n/* harmony import */ var _library_component_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../library/component.js */ \"./src/library/component.js\");\n/* harmony import */ var _components_home_navbar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/home/navbar.js */ \"./src/components/home/navbar.js\");\n/* harmony import */ var _components_profile_FriendMatchHistory_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/profile/FriendMatchHistory.js */ \"./src/components/profile/FriendMatchHistory.js\");\n/* harmony import */ var _components_profile_FriendProfileInfo_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/profile/FriendProfileInfo.js */ \"./src/components/profile/FriendProfileInfo.js\");\n/* harmony import */ var _utils_langPack_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/langPack.js */ \"./src/utils/langPack.js\");\n/* harmony import */ var _store_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../store/index.js */ \"./src/store/index.js\");\n// /src/views/friendProfile.js\n\n\n\n\n\n\n\nclass FriendProfile extends _library_component_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor() {\n        super({ element: document.getElementById(\"app\") });\n        this.friendUsername = null;\n        this.currentLang = _store_index_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"].state.language;\n        this.components = {\n            navBar: new _components_home_navbar_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](),\n            friendProfileInfo: null,\n            friendMatchHistory: null,\n        };\n\n        _store_index_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"].events.subscribe('stateChange', () => {\n            if (this.currentLang !== _store_index_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"].state.language) {\n                this.currentLang = _store_index_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"].state.language;\n                this.render();\n            }\n        });\n    }\n\n    setFriendUsername(username) {\n        this.friendUsername = username;\n        this.render();\n    }\n\n    async render() {\n        const langPack = _utils_langPack_js__WEBPACK_IMPORTED_MODULE_4__.profile[this.currentLang];\n\n        if (!this.friendUsername) {\n            console.error(langPack.friendUsernameNotSet);\n            return;\n        }\n\n        const view = /*html*/ `\n            <div class=\"h-100 d-flex flex-column bg-custom vh-100\">\n                <div class=\"row m-0\">\n                    <nav class=\"navbar navbar-expand bg-white shadow-sm w-100 mb-0\" id=\"navBar\"></nav>\n                </div>\n                <div class=\"container-fluid p-0 row flex-fill overflow-hidden m-0\">\n                    <div class=\"col-md-4 d-flex flex-column overflow-auto p-0\">\n                        <div id=\"friendProfileInfo\" class=\"m-4\"></div>\n                    </div>\n                    <div class=\"col-md-8 d-flex flex-column overflow-auto p-0\">\n                        <div id=\"friendMatchHistory\" class=\"flex-grow-1 d-flex flex-column mt-4 me-4 mb-4\"></div>\n                    </div>\n                </div>\n            </div>\n        `;\n        this.element.innerHTML = view;\n        this.components.navBar.render();\n\n        // Initialiser les composants après que les éléments sont créés dans le DOM\n        this.components.friendProfileInfo = new _components_profile_FriendProfileInfo_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]();\n        this.components.friendMatchHistory = new _components_profile_FriendMatchHistory_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n        this.components.friendProfileInfo.setFriendUsername(this.friendUsername);\n        this.components.friendMatchHistory.setFriendUsername(this.friendUsername);\n    }\n}\n\n//# sourceURL=webpack://frontend-pong/./src/views/friendProfile.js?");

/***/ })

}]);