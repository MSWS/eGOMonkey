// ==UserScript==
// @name         EGO MAUL Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey
// @updateURL    https://raw.githubusercontent.com/MSWS/eGOMonkey/master/Enhance_MAUL.js
// @version      STABLE-1.0.1
// @description  Add various enhancements & QOL additions to the EdgeGamers MAUL page that are beneficial for CS Leadership members.
// @author       blank_dvth, Left, Skle, MSWS
// @match        https://maul.edgegamers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @require      https://raw.githubusercontent.com/12pt/steamid-converter/master/js/converter-min.js
// @resource     admins https://raw.githubusercontent.com/MSWS/eGOMonkey/master/admins.txt
// @grant        GM_getResourceText
// ==/UserScript==

/* global SteamIDConverter, GM_getResourceText */

"use strict";

const knownAdmins = {}; // Known admin list

/**
 * Creates a preset div
 *
 * @returns {HTMLDivElement} Div to add presets to
 */
function createPresetDiv() {
    const div = document.createElement("div");
    const subtitle = document.createElement("h4");
    const child = document.getElementById("child_container");
    div.id = "preset_div";
    div.style.display = "flex";
    div.style.flexDirection = "row";
    div.style.paddingLeft = "15px";
    div.style.paddingBottom = "10px";
    subtitle.innerHTML = "Presets";
    subtitle.style.paddingLeft = "15px";
    child.insertBefore(div, document.querySelector("form"));
    child.insertBefore(subtitle, div);
    return div;
}

/**
 * Creates a preset button
 *
 * @param {string} text Button text
 * @param {function(Event)} callback Function to call on click
 * @returns {HTMLButtonElement} Button
 */
function createPresetButton(text, callback) {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-default");
    button.innerHTML = text;
    button.onclick = callback;
    button.style.marginRight = "4px";

    return button;
}

/**
 * Adds a preset button to the div
 *
 * @param {string} name Name of button
 * @param {HTMLDivElement} div Div to add to
 * @param {function(Event)} func Function to call on click
 */
function addPreset(name, div, func) {
    div.appendChild(createPresetButton(name, func));
}

/**
 * Creates a link button
 *
 * @param {string} text Button text
 * @param {string} link Button link
 * @returns {HTMLButtonElement} Button
 */
function createLinkButton(text, link) {
    const a = document.createElement("a");
    a.classList.add("btn", "btn-default");
    a.href = link;
    a.target = "_blank";
    a.innerHTML = text;
    a.style.marginRight = "4px";

    return a;
}

/**
 * Generates the proper forum thread link
 *
 * @param {string | number} threadId Thread ID
 * @param {string | number} postId Post ID
 * @returns {string} Formatted link
 */
function generateForumsURL(threadId, postId) {
    return `https://edgegamers.com/threads/${threadId}/` + ((postId) ? `#post-${postId}` : "");
}

/**
 * Loads known admins from the admins resource into the knownAdmins dictionary
 */
function loadAdmins() {
    const admins = GM_getResourceText("admins");
    admins.split("\n").forEach(line => {
        const separator = line.lastIndexOf("|");
        const username = line.substring(separator);
        const id = line.substring(separator + 1);
        knownAdmins[username] = id;
    });
}

/**
 * Adds presets for ban reason/duration/notes
 */
function handleAddBan() {
    const div = createPresetDiv();

    // Insert presets
    addPreset("Get IP (via Ban)", div, function () {
        document.getElementById("handle").value = "Suspected Ban Evader";
        document.getElementById("length").value = 1;
        document.getElementById("reason").value = "IP Check";
        document.getElementById("notes").value = "Checking IP";
    });
    addPreset("Ban Evasion", div, function () {
        document.getElementById("reason").value = "Ban Evasion";
        const length = document.getElementById("length");
        length.value = 0;
        length.disabled = true;
    });
    // You can add more presets following the format shown above
}

/**
 * Adds presets for ban evasion, and misc. utility buttons
 */
function handleEditBan() {
    const div = createPresetDiv();

    // Insert presets
    addPreset("Ban Evasion", div, function () {
        document.getElementById("reason").value = "Ban Evasion";
        const length = document.getElementById("length");
        if (length.value) {
            length.value = 0;
            length.disabled = true;
        }
    });

    // Steam ID buttons
    const idGroup = document.querySelector(".control-label[for=gameId]").parentElement;
    const id = idGroup.querySelector("p").innerText;
    const idDiv = document.createElement("div");
    idDiv.style.display = "flex";
    idDiv.style.fledDirection = "row";
    idDiv.style.paddingTop = "10px";
    idGroup.appendChild(idDiv);
    idDiv.appendChild(createLinkButton("Steam", "https://steamcommunity.com/profiles/" + id, "_blank"));
    idDiv.appendChild(createLinkButton("GameME", "https://edgegamers.gameme.com/search?si=uniqueid&rc=all&q=" + SteamIDConverter.toSteamID(id), "_blank"));
    idDiv.appendChild(createLinkButton("SteamID (IO)", "https://steamid.io/lookup/" + id, "_blank"));
    idDiv.appendChild(createLinkButton("SteamID (UK)", "https://steamid.uk/profile/" + id, "_blank"));

    // IP buttons
    const ipGroup = Array.from(document.querySelectorAll(".control-label")).find(el => el.textContent === "IP").parentElement; // BECAUSE MAUL HAS THE IP LABELED WITH THE WRONG FOR
    const ip = ipGroup.querySelector("p").innerText;
    const ipDiv = document.createElement("div");
    ipDiv.style.display = "flex";
    ipDiv.style.fledDirection = "row";
    ipDiv.style.paddingTop = "10px";
    ipGroup.appendChild(ipDiv);
    ipDiv.appendChild(createLinkButton("Check Spur", "https://spur.us/context/" + ip, "_blank"));
    ipDiv.appendChild(createLinkButton("Check IPInfo", "https://ipinfo.io/" + ip, "_blank"));
}

/**
 * Automatically converts old links to updated ones
 */
function handleProfile() {
    const userNotes = [...document.querySelectorAll("div.col-xs-6 > div > div:nth-child(3)")];
    userNotes.forEach(userNote => {
        userNote.textContent = userNote.textContent.replaceAll(
            /(?:https?:\/\/)?(?:www\.)?edge-gamers\.com\/forums\/showthread\.php\?p=(\d+)(?:#?post(\d+))?/g,
            function (match, threadId, postId) {
                return generateForumsURL(threadId, postId);
            });
        userNote.textContent = userNote.textContent.replaceAll(
            /(?:https?:\/\/)?(?:www\.)?edge-gamers\.com\/forums\/showthread\.php\?(\d+)[a-zA-Z]*/g,
            function (match, threadId) {
                return generateForumsURL(threadId, null);
            });
    });
}

/**
 * Adds hyperlinks to each admin within a string
 *
 * @param {string} str String with admin names separated by commas
 * @returns {string} The string with hyperlinks
 */
function assignAdminsOnlineHyperlink(str) {
    const admins = [];
    for (const admin of str.split(", ")) {
        const id = knownAdmins[admin];
        if (id === undefined)
            continue;
        admins.push(`<a href="https://maul.edgegamers.com/index.php?page=home&id=${id}">${admin}</a>`);
    }

    return ", ".join(admins);
}

/**
 * Adds hyperlinks to the Banning Admins fields
 */
function convertBanningAdmins() {
    if (Object.keys(knownAdmins).length)
        loadAdmins();
    const headers = document.querySelectorAll(".expand > td > span.pull-left");
    let wasAdminOnline = false;
    for (const header of headers) {
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

/**
 * Converts any links in ban notes to hyperlinks
 */
function updateBanNoteURLs() {
    const banNotes = document.querySelectorAll("span[id*=notes].col-xs-10");
    for (const banNote of banNotes) {
        // Replace the text with a linkified version
        const replaced = banNote.innerHTML.replaceAll(
            /https?:\/\/(www\.)?[-a-zA-Z0-9.]{1,256}\.[a-zA-Z0-9]{2,6}\b(\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g,
            "<a href=\"$&\" target=\"_blank\">$&</a>"
        );
        // If the text hasn't been changed, move on
        if (replaced === banNote.innerHTML)
            continue;
        // Create a hidden div to store the original text
        const hiddenDiv = document.createElement("span");
        hiddenDiv.style.display = "none";
        hiddenDiv.innerHTML = banNote.innerHTML;
        hiddenDiv.id = banNote.id + "_original";
        // Replace the text with a linkified version
        banNote.innerHTML = replaced;
        // Add the hidden div to the DOM
        banNote.parentElement.appendChild(hiddenDiv);
        // Add an event listener to the edit button to restore the original text. The edit notes button takes the text from the span, and we need to avoid having the linkified text in the edit box.
        const editNotes = banNote.parentElement.querySelector("span.edit_note_button");
        // We're using mousedown instead of click because the click event fires too late, and the textarea is already populated with the linkified text. The textarea is populated during click/mouseup, so mousedown fires before that.
        const handleEditNotesClick = function (event) {
            banNote.innerHTML = hiddenDiv.innerHTML;
            event.target.removeEventListener("mousedown", handleEditNotesClick);
            hiddenDiv.remove();
        };
        editNotes.addEventListener("mousedown", handleEditNotesClick);
    }
}

/**
 * Updates banning admins and ban notes
 */
function handleBanList() {
    convertBanningAdmins();
    updateBanNoteURLs();
}

(function () {
    // Determine what page we're on
    const url = window.location.href;

    if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?page=editban\/?$/))  // Add Ban Page (not Edit, that will have &id=12345 in the URL)
        handleAddBan();
    else if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?page=editban&id=\d+$/))  // Edit Ban Page
        handleEditBan();
    else if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?page=home&id=\d+$/))  // Profile Page
        handleProfile();
    else if (url.match(/^https:\/\/maul\.edgegamers\.com\/index\.php\?[-=a-zA-Z0-9&]*page=bans.*$/)) // List Ban Page
        handleBanList();
})();
