/*jshint esversion: 8 */

const todo_lines = [];
const carddb = {};
let pinboard = null;
let card_seq = 100;

// Helpers

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
const openFile = async () => { try { 
    const [handle] = await window. showOpenFilePicker(); 
    const file = await handle.getFile();
    const contents = await file.text(); 
    return contents; 
} catch (err) { console.error(err.name, err.message); return null; } };

///////////////////////////////////////////////////////////////////////////////
// Application Code

async function cardTitleInput(e) {
    if((e.type == "keydown") && (e.code != "Enter")) return;
    
    e.target.innerText = e.target.innerText.trim();
    e.target.contentEditable = false;
    e.target.parentElement.classList.remove("new");
    e.target.parentElement.setAttribute("ts", Number(new Date()));
    
    const seq = Number(e.target.parentElement.getAttribute("seq"));
    if(seq > 0) { } else {
        e.target.parentElement.setAttribute("seq", card_seq);
        card_seq++;
    }

    scrapCardsForChanges();
}

async function createNewCard(e) {
    const newCard = makeTag("div", "card new");
    const titleOfCard = makeTag("h1", "", "");
    newCard.appendChild(titleOfCard);
    newCard.appendChild(makeTag("p", "", "..."));
    newCard.style.left = e.offsetX + "px";
    newCard.style.top = e.offsetY + "px";
    
    newCard.setAttribute("x", e.offsetX);
    newCard.setAttribute("y", e.offsetY);
    
    pinboard.appendChild(newCard);

    titleOfCard.contentEditable = "true";
    titleOfCard.addEventListener("keydown", cardTitleInput, { passive: true });
    titleOfCard.addEventListener("focusout", cardTitleInput, { passive: true });
    titleOfCard.focus();
}

async function createCard(cData) {
    const newCard = makeTag("div", "card new");
    const titleOfCard = makeTag("h1", "", cData.title);
    newCard.appendChild(titleOfCard);
    newCard.appendChild(makeTag("p", "", cData.desc));
    newCard.style.left = cData.x + "px";
    newCard.style.top = cData.y + "px";
    
    newCard.setAttribute("x", cData.x);
    newCard.setAttribute("y", cData.y);
    newCard.setAttribute("ts", cData.ts);
    newCard.setAttribute("seq", cData.seq);
    
    pinboard.appendChild(newCard);
}

async function canvasClick(e) {
    if((e.target == pinboard) || (e.path.length <= 3))
        createNewCard(e);
}

async function scrapCardsForChanges() {
    const seqList = [];

    const clist = document.getElementsByClassName("card");
    for (let i = 0; i < clist.length; i++) {
        const cData = { title: "", desc: "", seq: -1, ts: 0 };
        const element = clist[i];

        cData.title = element.getElementsByTagName("h1")[0].innerText;
        cData.desc = element.getElementsByTagName("p")[0].innerText;
        cData.seq = Number(element.getAttribute("seq"));
        cData.ts = Number(element.getAttribute("ts"));
        cData.x = Number(element.getAttribute("x"));
        cData.y = Number(element.getAttribute("y"));

        if((cData.seq > 0) && (cData.ts > 0)) {
            carddb[cData.seq] = cData;
            seqList.push(cData.seq);
            lset("card_" + cData.seq, cData);
        }
    }

    lset("seqList", seqList);
}


///////////////////////////////////////////////////////////////////////////////
// Window Events
window.addEventListener("load", async () => {
    pinboard = document.getElementById("pinboard");    
    document.addEventListener("click", canvasClick, { passive: true });

    const seqList = lget("seqList");
    for (let i = 0; (seqList) && (i < seqList.length); i++) {
        const cData = lget("card_" + seqList[i]);
        if((cData.seq > 0) && (cData.ts > 0)) {
            carddb[cData.seq] = cData;
            createCard(cData);

            if(cData.seq >= card_seq) card_seq = cData.seq + 1;
        }
    }
});
