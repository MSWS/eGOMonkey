// ==UserScript==
// @name         EGO MAUL Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey
// @downloadURL  %DOWNLOAD%
// @version      %VERSION%
// @description  Add various enhancements & QOL additions to the EdgeGamers MAUL page that are beneficial for CS Leadership members.
// @author       blank_dvth, Left, Skle, MSWS
// @match        https://maul.edgegamers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @require      https://raw.githubusercontent.com/12pt/steamid-converter/master/js/converter-min.js
// @resource     admins https://raw.githubusercontent.com/MSWS/eGOMonkey/master/admins.txt
// @grant        GM_getResourceText
// ==/UserScript==

// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* global SteamIDConverter, GM_getResourceText */

// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any, camelcase
declare var SteamIDConverter, GM_getResourceText: any;

const knownAdmins: { [key: string]: string } = {}; // Known admin list

/**
 * Creates a preset div
 *
 * @returns {HTMLDivElement} Div to add presets to
 */
function createMAULDiv() {
    const div = document.createElement("div");
    const subtitle = document.createElement("h4");
    const child = document.getElementById("child_container");
    if (!child)
        return div;
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
 * @param {(MouseEvent) => any} callback Function to call on click
 * @returns {HTMLButtonElement} Button
 */
function createMAULPresetButton(text: string, callback: (event: MouseEvent) => void) {
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
 * @param {(MouseEvent) => void} func Function to call on click
 */
function addMAULPreset(name: string, div: HTMLDivElement, func: (event: MouseEvent) => void) {
    div.appendChild(createMAULPresetButton(name, func));
}

/**
 * Creates a link button
 *
 * @param {string} text Button text
 * @param {string} link Button link
 * @param {string} target Button target
 * @returns {HTMLButtonElement} Button
 */
function createLinkButton(text: string, link: string, target = "_blank") {
    const a = document.createElement("a");
    a.classList.add("btn", "btn-default");
    a.href = link;
    a.target = target;
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
function generateForumsURL(threadId: string | number, postId: string | number) {
    return `https://edgegamers.com/threads/${threadId}/` + ((postId) ? `#post-${postId}` : "");
}

/**
 * Loads known admins from the admins resource into the knownAdmins dictionary
 */
function loadAdmins() {
    const admins = GM_getResourceText("admins");
    admins.split("\n").forEach((line: string) => {
        const separator = line.lastIndexOf("|");
        const username = line.substring(0, separator);
        const id = line.substring(separator + 1);
        knownAdmins[username] = id;
    });
}

/**
 * Adds presets for ban reason/duration/notes
 */
function handleAddBan() {
    const div = createMAULDiv();

    // Insert presets
    addMAULPreset("Get IP (via Ban)", div, function () {
        (document.getElementById("handle") as HTMLFormElement).value = "Suspected Ban Evader";
        (document.getElementById("length") as HTMLFormElement).value = 1;
        (document.getElementById("reason") as HTMLFormElement).value = "IP Check";
        (document.getElementById("notes") as HTMLFormElement).value = "Checking IP";
    });
    addMAULPreset("Ban Evasion", div, function () {
        (document.getElementById("reason") as HTMLFormElement).value = "Ban Evasion";
        const length = document.getElementById("length") as HTMLFormElement;
        length.value = 0;
        length.disabled = true;
    });
    // You can add more presets following the format shown above
}

/**
 * Adds presets for ban evasion, and misc. utility buttons
 */
function handleEditBan() {
    const div = createMAULDiv();

    // Insert presets
    addMAULPreset("Ban Evasion", div, function () {
        (document.getElementById("reason") as HTMLFormElement).value = "Ban Evasion";
        const length = document.getElementById("length") as HTMLFormElement;
        if (length.value) {
            length.value = 0;
            length.disabled = true;
        }
    });

    // Steam ID buttons
    const idGroup = document.querySelector(".control-label[for=gameId]")?.parentElement;
    const id = idGroup?.querySelector("p")?.innerText;
    const idDiv = document.createElement("div");
    idDiv.style.display = "flex";
    idDiv.style.flexDirection = "row";
    idDiv.style.paddingTop = "10px";
    idGroup?.appendChild(idDiv);
    idDiv.appendChild(createLinkButton("Steam", "https://steamcommunity.com/profiles/" + id));
    idDiv.appendChild(createLinkButton("GameME", "https://edgegamers.gameme.com/search?si=uniqueid&rc=all&q=" + SteamIDConverter.toSteamID(id)));
    idDiv.appendChild(createLinkButton("SteamID (IO)", "https://steamid.io/lookup/" + id));
    idDiv.appendChild(createLinkButton("SteamID (UK)", "https://steamid.uk/profile/" + id));

    // IP buttons
    const ipGroup = Array.from(document.querySelectorAll(".control-label")).find(el => el.textContent === "IP")?.parentElement; // BECAUSE MAUL HAS THE IP LABELED WITH THE WRONG FOR
    const ip = ipGroup?.querySelector("p")?.innerText;
    const ipDiv = document.createElement("div");
    ipDiv.style.display = "flex";
    ipDiv.style.flexDirection = "row";
    ipDiv.style.paddingTop = "10px";
    ipGroup?.appendChild(ipDiv);
    ipDiv.appendChild(createLinkButton("Check Spur", "https://spur.us/context/" + ip));
    ipDiv.appendChild(createLinkButton("Check IPInfo", "https://ipinfo.io/" + ip));
}

/**
 * Automatically converts old links to updated ones
 */
function handleProfile() {
    const userNotes = [...document.querySelectorAll("div.col-xs-6 > div > div:nth-child(3)")];
    userNotes.forEach(userNote => {
        if (!userNote.textContent) return;
        userNote.textContent = userNote.textContent.replaceAll(
            /(?:https?:\/\/)?(?:www\.)?edge-gamers\.com\/forums\/showthread\.php\?p=(\d+)(?:#?post(\d+))?/g,
            function (match, threadId, postId) {
                return generateForumsURL(threadId, postId);
            });
        userNote.textContent = userNote.textContent.replaceAll(
            /(?:https?:\/\/)?(?:www\.)?edge-gamers\.com\/forums\/showthread\.php\?(\d+)[a-zA-Z]*/g,
            function (match, threadId) {
                return generateForumsURL(threadId, "");
            });
    });
}

/**
 * Adds hyperlinks to each admin within a string
 *
 * @param {string} str String with admin names separated by commas
 * @returns {string} The string with hyperlinks
 */
function assignAdminsOnlineHyperlink(str: string) {
    const admins = [];
    for (const admin of str.split(", ")) {
        const id = knownAdmins[admin];
        if (id === undefined) {
            admins.push(admin);
            continue;
        }
        admins.push(`<a href="https://maul.edgegamers.com/index.php?page=home&id=${id}">${admin}</a>`);
    }

    return admins.join(", ");
}

/**
 * Adds hyperlinks to the Banning Admins fields
 */
function convertBanningAdmins() {
    if (!Object.keys(knownAdmins).length)
        loadAdmins();
    const headers = document.querySelectorAll(".expand > td > span.pull-left") as NodeListOf<HTMLElement>;
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
        banNote.parentElement?.appendChild(hiddenDiv);
        // Add an event listener to the edit button to restore the original text. The edit notes button takes the text from the span, and we need to avoid having the linkified text in the edit box.
        const editNotes = banNote.parentElement?.querySelector("span.edit_note_button");
        // We're using mousedown instead of click because the click event fires too late, and the textarea is already populated with the linkified text. The textarea is populated during click/mouseup, so mousedown fires before that.
        const handleEditNotesClick = function (event: MouseEvent) {
            banNote.innerHTML = hiddenDiv.innerHTML;
            event.target?.removeEventListener("mousedown", handleEditNotesClick as EventListener);
            hiddenDiv.remove();
        };
        editNotes?.addEventListener("mousedown", handleEditNotesClick as EventListener);
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

