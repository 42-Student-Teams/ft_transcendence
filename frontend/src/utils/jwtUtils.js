/* Adapted from https://stackoverflow.com/a/69058154 */
function tokenToObject() {
    if (localStorage.getItem("jwt") === null) {
      return (null);
    }
    let token = localStorage.getItem("jwt");
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
        .split("")
        .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return (JSON.parse(jsonPayload));
}

function tokenExpired() {
    let tokenObj = tokenToObject();
    if (tokenObj === null) {
		console.log("tokenExpired: tokenObj is null");
        return (true);
    }

	console.log(`tokenExpired: tokenObj['expires'] = ${tokenObj['expires']}, Date.now() / 1000 = ${Date.now() / 1000}`);
    //alert(`now: ${Date.now() / 1000}, jwt: ${tokenObj['expires']}`);
    return (tokenObj['expires'] < Date.now() / 1000);
}

function usernameFromToken() {
    let tokenObj = tokenToObject();
    if (tokenObj === null) {
        return (null);
    }
    return (tokenObj['username']);
}

export { tokenExpired };
export { usernameFromToken };