/*jshint esversion: 8 */

const heartbeatInterval = 1000 * 60; //ms between PING's
const reconnectInterval = 1000 * 3; //ms to wait before reconnect
const badgeList = {};
const msgLog = [];
const logThese = ["PRIVMSG", "NOTICE", "JOIN", "PART"];
const twitchRateBucket = {
    ts: 0,
    hot: 0
};
const wsock = {
    chat: null,
    event: null
}

function encodeUri(url, data) {
    if(typeof(data) == "string") return url + "?" + encodeURIComponent(data);

    let ui = [];
    for (const key in data) if (data.hasOwnProperty(key)) ui.push(key + "=" + encodeURIComponent(data[key]));
    return url + "?" + ui.join("&")
}

function fetch(url, data) {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            if (req.responseXML) resolve(req.responseXML);
            else {
                const j = JSON.parse(req.response);
                if (j) resolve(j);
                else resolve(req.response);
            }
        });
        req.addEventListener("error", () => { reject(req); });
        req.open('GET', url);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.setRequestHeader("Accept", "application/json");
        if (data)
            req.send(data);
        else
            req.send(null);
    });
}

function makeTag(tag, cn, text) {
    if (tag == undefined) tag = "span";
    const el = document.createElement(tag);
    if (cn) el.className = cn;
    if (text) el.innerText = text;
    return el;
}

function lget(name) { let v = window.localStorage.getItem(name); try { return JSON.parse(v); } catch (error) { return v; }}
function lset(name,value) { if(typeof(value) != "string") value = JSON.stringify(value); return window.localStorage.setItem(name, value); }

///////////////////////////////////////////////////////////////////////////////
// Application Code

function doAuth() {
    let oAuthState = btoa(Math.random());
    lset("authstate", oAuthState)
    window.location = encodeUri("https://github.com/login/oauth/authorize", {
        client_id: client.id,
        redirect_uri: "http://localhost:8000/",
        scope: "gist",
        state: oAuthState
    });
}


///////////////////////////////////////////////////////////////////////////////
// Window Events
window.addEventListener("load", async () => {


});
