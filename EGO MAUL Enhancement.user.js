// ==UserScript==
// @name         EdgeGamers MAUL Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey/blob/master/EGO%20MAUL%20Enhancement.user.js
// @version      2.0.1
// @description  Add various enhancements & QOL additions to the EdgeGamers MAUL page that are beneficial for CS Leadership members.
// @author       blank_dvth, Left, Skle, MSWS
// @match        https://maul.edgegamers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @require      https://raw.githubusercontent.com/12pt/steamid-converter/master/js/converter-min.js
// @resource     admins https://raw.githubusercontent.com/MSWS/eGOMonkey/master/admins.txt
// @grant        GM_getResourceText
// ==/UserScript==

'use strict';
let knownAdmins = {}; // Known admin list

/**
 * Adds a preset button to the div
 * @param {string} name Name of button
 * @param {HTMLDivElement} div Div to add to
 * @param {function(HTMLElementEventMap)} func Function to call on click
 */
function addPreset(name, div, func) {
    div.appendChild(createPresetButton(name, func));
}

/**
 * Creates a preset div
 * @returns {HTMLDivElement} Div to add presets to
 */
function createPresetDiv() {
    let div = document.createElement("div");
    let subtitle = document.createElement("h4");
    let child_container = document.getElementById("child_container")
    div.id = "preset_div";
    div.style.display = "flex";
    div.style.flexDirection = "row";
    div.style.paddingLeft = "15px";
    div.style.paddingBottom = "10px";
    subtitle.innerHTML = "Presets";
    subtitle.style.paddingLeft = "15px";
    child_container.insertBefore(div, document.querySelector("form"));
    child_container.insertBefore(subtitle, div)
    return div;
}

/**
 * Creates a preset button
 * @param {string} text Button text
 * @param {function(HTMLElementEventMap)} callback Function to call on click  
 * @returns {HTMLButtonElement} Button
 */
function createPresetButton(text, callback) {
    let button = document.createElement("button");
    button.classList.add("btn", "btn-default");
    button.innerHTML = text;
    button.onclick = callback;
    button.style.marginRight = "4px";
    return button
}

/**
 * Creates a link button
 * @param {string} text 
 * @param {string} link 
 * @returns {HTMLButtonElement} Button
 */
function createLinkButton(text, link) {
    let a = document.createElement("a");
    a.classList.add("btn", "btn-default");
    a.href = link;
    a.target = "_blank";
    a.innerHTML = text;
    a.style.marginRight = "4px";
    return a;
}

/**
 * Generates the proper forum thread link
 * @param {*} threadId Thread ID
 * @param {*} postId Post ID
 * @returns Formatted link
 */
function generateForumsURL(threadId, postId) {
    return `https://edgegamers.com/threads/${threadId}/` + ((postId) ? `#post-${postId}` : "");
}

/**
 * Loads known admins from the admins resource into the knownAdmins dictionary
 */
function loadAdmins() {
    let admins = GM_getResourceText("admins");
    admins.split("\n").forEach(line => {
        let separator = line.lastIndexOf("|");
        let username = line.substring(0, separator)
        let id = line.substring(separator + 1);
        knownAdmins[username] = id;
    });
}

/**
 * Adds presets for ban reason/duration/notes
 */
function handleAddBan() {
    let div = createPresetDiv();

    // Insert presets
    addPreset("Get IP (via Ban)", div, function () {
        document.getElementById("handle").value = "Suspected Ban Evader";
        document.getElementById("length").value = 1;
        document.getElementById("reason").value = "IP Check";
        document.getElementById("notes").value = "Checking IP";
    });
    addPreset("Ban Evasion", div, function () {
        document.getElementById("reason").value = "Ban Evasion";
        let length = document.getElementById("length");
        length.value = 0;
        length.disabled = true;
    });
    // You can add more presets following the format shown above
}

/**
 * Adds presets for ban evasion, and misc. utility buttons
 */
function handleEditBan() {
    let div = createPresetDiv();

    // Insert presets
    addPreset("Ban Evasion", div, function () {
        document.getElementById("reason").value = "Ban Evasion";
        let length = document.getElementById("length");
        if (length.value != 0) {
            length.value = 0;
            length.disabled = true;
        }
    });

    // Steam ID buttons
    let id_group = document.querySelector(".control-label[for=gameId]").parentElement;
    let id = id_group.querySelector("p").innerText;
    let id_div = document.createElement("div");
    id_div.style.display = "flex";
    id_div.style.fledDirection = "row";
    id_div.style.paddingTop = "10px";
    id_group.appendChild(id_div);
    id_div.appendChild(createLinkButton("Steam", "https://steamcommunity.com/profiles/" + id, "_blank"));
    id_div.appendChild(createLinkButton("GameME", "https://edgegamers.gameme.com/search?si=uniqueid&rc=all&q=" + SteamIDConverter.toSteamID(id), "_blank"));
    id_div.appendChild(createLinkButton("SteamID (IO)", "https://steamid.io/lookup/" + id, "_blank"));
    id_div.appendChild(createLinkButton("SteamID (UK)", "https://steamid.uk/profile/" + id, "_blank"));

    // IP buttons
    let ip_group = Array.from(document.querySelectorAll(".control-label")).find(el => el.textContent === "IP").parentElement; // BECAUSE MAUL HAS THE IP LABELED WITH THE WRONG FOR
    let ip = ip_group.querySelector("p").innerText;
    let ip_div = document.createElement("div");
    ip_div.style.display = "flex";
    ip_div.style.fledDirection = "row";
    ip_div.style.paddingTop = "10px";
    ip_group.appendChild(ip_div);
    ip_div.appendChild(createLinkButton("Check Spur", "https://spur.us/context/" + ip, "_blank"));
    ip_div.appendChild(createLinkButton("Check IPInfo", "https://ipinfo.io/" + ip, "_blank"));
}

/**
 * Automatically converts old links to updated ones
 */
function handleProfile() {
    let userNotes = [...document.querySelectorAll("div.col-xs-6 > div > div:nth-child(3)")];
    userNotes.forEach(userNote => {
        userNote.textContent = userNote.textContent.replaceAll(
            /(?:https?:\/\/)?(?:www\.)?edge-gamers\.com\/forums\/showthread\.php\?p=(\d+)(?:#?post(\d+))?/g,
            function (match, threadId, postId) {
                return generateForumsURL(threadId, postId);
            });
        userNote.textContent = userNote.textContent.replaceAll(
            /(?:https?:\/\/)?(?:www\.)?edge-gamers\.com\/forums\/showthread\.php\?(\d+)[\-a-zA-Z]*/g,
            function (match, threadId) {
                return generateForumsURL(threadId, null);
            });
    });
}

/**
 * Updates banning admins and ban notes
 */
function handleBanList() {
    convertBanningAdmins();
    updateBanNoteURLs();
}

/**
 * Adds hyperlinks to each admin within a string
 * @param {string} str 
 * @returns {string} The string with hyperlinks
 */
function assignAdminsOnlineHyperlink(str) {
    for (let admin of str.split(", ")) {
        let id = knownAdmins[admin];
        if (id == undefined)
            continue;
        str = str.replace(admin, `<a href="https://maul.edgegamers.com/index.php?page=home&id=${id}">${admin}</a>`);
    }
    return str;
}

/**
 * Adds hyperlinks to the Banning Admins fields
 */
function convertBanningAdmins() {
    if (Object.keys(knownAdmins).length === 0)
        loadAdmins();
    let headers = document.querySelectorAll(".expand > td > span.pull-left");
    let wasAdminOnline = false;
    for (let header of headers) {
        if (header.innerText === "Admins Online:") {
            wasAdminOnline = true;
            continue;
        } else if (!wasAdminOnline)
            continue;
        // Last header was Admins Online
        header.innerHTML = assignAdminsOnlineHyperlink(header.innerText);
        wasAdminOnline = false;
    }
}

function updateBanNoteURLs() {
    let banNotes = document.querySelectorAll("span[id*=notes].col-xs-10");
    banNotes.forEach(banNote => {
        // Replace the text with a linkified version
        let replaced = banNote.innerHTML.replaceAll(
            /https?:\/\/(www\.)?[-a-zA-Z0-9.]{1,256}\.[a-zA-Z0-9]{2,6}\b(\/[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
            '<a href="$&" target="_blank">$&</a>'
        );
        // If the text hasn't been changed, move on
        if (replaced === banNote.innerHTML)
            return;
        // Create a hidden div to store the original text
        let hiddenDiv = document.createElement("span");
        hiddenDiv.style.display = "none";
        hiddenDiv.innerHTML = banNote.innerHTML;
        hiddenDiv.id = banNote.id + "_original";
        // Replace the text with a linkified version
        banNote.innerHTML = replaced;
        // Add the hidden div to the DOM
        banNote.parentElement.appendChild(hiddenDiv);
        // Add an event listener to the edit button to restore the original text. The edit notes button takes the text from the span, and we need to avoid having the linkified text in the edit box.
        let editNotes = banNote.parentElement.querySelector("span.edit_note_button");
        // We're using mousedown instead of click because the click event fires too late, and the textarea is already populated with the linkified text. The textarea is populated during click/mouseup, so mousedown fires before that.
        function handleEditNotesClick(event) {
            banNote.innerHTML = hiddenDiv.innerHTML;
            event.target.removeEventListener("mousedown", handleEditNotesClick);
            hiddenDiv.remove();
        }
        editNotes.addEventListener("mousedown", handleEditNotesClick);
    });
}

(function () {
    // Determine what page we're on
    let url = window.location.href;

    if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?page=editban\/?$/))  // Add Ban Page (not Edit, that will have &id=12345 in the URL)
        handleAddBan();
    else if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?page=editban&id=\d+$/))  // Edit Ban Page
        handleEditBan();
    else if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?page=home&id=\d+$/))  // Profile Page
        handleProfile();
    else if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?[-=a-zA-Z0-9&]*page=bans.*$/)) // List Ban Page
        handleBanList();
})();
