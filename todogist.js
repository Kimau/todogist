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

///////////////////////////////////////////////////////////////////////////////
// Application Code


///////////////////////////////////////////////////////////////////////////////
// Window Events
window.addEventListener("load", async () => {

    await buildBadges();

    const oldday = window.localStorage.getItem('today');
    if(oldday != new Date().toLocaleDateString()) {
        // new stream day
        console.log("NEW DAY!");
        window.localStorage.setItem('talkers', "");
        window.localStorage.setItem('today', new Date().toLocaleDateString());
        window.localStorage.setItem('msglog', "");
    } else {
        let msglogtext = window.localStorage.getItem("msglogbackup");
        if(!msglogtext || (msglogtext.length < 10)) {
            msglogtext = window.localStorage.getItem("msglog");
            window.localStorage.setItem('msglogbackup', msglogtext);
        }

        const oldMsgLog = JSON.parse(msglogtext);        
        if(Array.isArray(oldMsgLog)) for (let i = 0; i < oldMsgLog.length; i++) {
            handleMsg(oldMsgLog[i]);
        }
        window.localStorage.setItem('msglogbackup', "");
    }

    if ((token == null) || (token == '') || (token == "null")) {
        let twitchOAuthState = btoa(Math.random());
        console.log('https://id.twitch.tv/oauth2/authorize' +
            '?response_type=token' +
            '&client_id=' + client_id +
            '&redirect_uri=http%3A%2F%2Flocalhost' +
            '&state=' + twitchOAuthState +
            '&scope=bits:read+clips:edit+user:read:email+channel:read:subscriptions+channel:read:redemptions');

        window.localStorage.setItem('token', window.prompt('Enter your OAuth Token', ''));
    }

    doChat();
    doEvents();
});

window.addEventListener("click", (e) => { 
    useAudio = true; 
    mySpeak("Audio on");
});