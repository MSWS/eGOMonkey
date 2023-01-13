// ==UserScript==
// @name         EGO MS Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey
// @updateURL    https://raw.githubusercontent.com/MSWS/eGOMonkey/master/Enhance_MS.js
// @version      %VERSION%
// @description  Add various enhancements & QOL additions to the EdgeGamers Forums that are beneficial for MS members.
// @author       Skle, MSWS
// @match        https://www.edgegamers.com/application/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @grant        none
// ==/UserScript==

"use strict";

const POPUP_CHILDREN = 2; // How many children are in the "On Hold" popup

/**
 * Adds a preset button to the div
 *
 * @param {HTMLButtonElement} button Button to add
 * @param {HTMLDivElement} div Div to add to
 * @param {boolean} before Whether to add the button before the last child
 */
function addPreset(button, div, before = true) {
    if (before)
        div.insertBefore(button, div.childNodes[div.childNodes.length - 1]);
    else
        div.appendChild(button);
}

/**
 * Creates a preset button
 *
 * @param {string} text Button text
 * @param {function(Event)} callback Function to call on click
 * @returns {HTMLButtonElement} Button
 */
function createPresetButton(text, callback) {
    const button = document.createElement("span");
    button.classList.add("button");
    button.innerHTML = text;
    button.onclick = callback;
    button.style.marginLeft = "4px";
    button.style.marginTop = "4px";

    return button;
}

/**
 * Creates a button that links to a URL
 *
 * @param {string} text Button's text
 * @param {string} url  URL to link to
 * @returns {HTMLButtonElement} Generated button
 */
function createPresetURLButton(text, url) {
    const button = document.createElement("a");
    button.classList.add("button");
    button.classList.add("button-fix");
    button.innerHTML = text;
    button.href = url;
    button.style.marginLeft = "4px";
    button.style.marginTop = "4px";

    return button;
}

/**
 * Adds "On Hold" templates to the menu and increases the size of the explain box.
 *
 * @param {Event} event Event
 */
function handleOnHold(event) {
    if (event.target.nodeName !== "DIV" || !event.target.classList.contains("overlay-container"))
        return;

    // Event may fire twice - add a mark the first time it fires, and ignore the rest
    const mark = document.createElement("input");
    mark.type = "hidden";
    event.target.append(mark);
    if (event.target.childNodes.length > POPUP_CHILDREN)
        return;

    const body = event.target.querySelector(".overlay > .overlay-content > form > .block-container > .block-body");
    const reason = body.querySelector(":nth-child(1) > dd > input");
    let explain = body.querySelector(":nth-child(2) > dd > input");
    // Convert the explain input into a textarea
    explain.outerHTML = explain.outerHTML.replace("input", "textarea");
    // Variable gets dereferenced - reference it again
    explain = body.querySelector(":nth-child(2) > dd > textarea");
    explain.style.height = "200px";
    explain.setAttribute("maxlength", "1024");
    const div = body.querySelector(":nth-child(4) > dd > div > .formSubmitRow-controls");

    addPreset(createPresetButton("No MAUL", function () {
        reason.value = "MAUL account must be created and verified";
        explain.value =
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + " then click the Sign in through Steam button under the Source ID section. Once you've done so, please reply to this post!";
    }), div);

    addPreset(createPresetButton("Steam ID", function () {
        reason.value = "Steam account must be verified in MAUL";
        explain.value =
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + " then click the Sign in through Steam button under the Source ID section. Once you've done so, please reply to this post!";
    }), div);

    addPreset(createPresetButton("Minecraft ID", function () {
        reason.value = "Minecraft ID must be verified in MAUL";
        explain.value =
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + " then under ID for Minecraft, input your Minecraft username, click Convert to Game ID, then log onto our Minecraft server."
            + " Once you've done so, please reply to this post!";
    }), div);

    addPreset(createPresetButton("Battlefield ID", function () {
        reason.value = "Battlefield account must be verified in MAUL";
        explain.value =
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar,"
            + " in MAUL hover over the home link in the top left,"
            + " click help, then follow the instructions for Battlefield. Once you have done so, please reply to this post!";
    }), div);

    addPreset(createPresetButton("Discord ID", function () {
        reason.value = "Discord ID must be verfied in MAUL";
        explain.value =
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + "then click the sign in through Discord button under the discord ID section. Once you have done so, please reply to this post!";
    }), div);

    addPreset(createPresetButton("Name", function () {
        reason.value = "Inappropriate Name";
        explain.value =
            "As for your name, Please click [URL='https://www.edgegamers.com/account/username']here[/URL] and fill out a name change request."
            + " After you fill it out, please wait while your name change request is finalized and the change is completed."
            + " Once it is done your application process will resume. If you want to have an understanding on our naming"
            + " policy inside of eGO please click [URL='https://www.edgegamers.com/threads/378540/']here[/URL].";
    }), div);
}

/**
 * Adds misc. MS buttons that are normally not shown
 *
 * @param {HTMLDivElement} div Div to add to
 * @param {boolean} access True if we have access to the page
 */
function addSuperButtons(div, access = true) {
    const url = window.location.href;
    const id = url.substring(url.lastIndexOf("application/") + "application/".length).replace("/", "");
    let status;
    if (access)
        status = document.querySelector(".badge").textContent.trim();

    addPreset(createPresetURLButton("Deny", `/application/${id}/state?state_id=5`), div);
    if (access) {
        div.append(document.createElement("br"));
        div.appendChild(document.createElement("br"));
    }
    if (!access || status !== "Pending")
        addPreset(createPresetURLButton("Set to Pending", `/application/${id}/state?state_id=2`), div);
    if (!access || status !== "On Hold" && status !== "Pending")
        addPreset(createPresetURLButton("On Hold", `/application/${id}/state?state_id=3`), div);

    addPreset(createPresetURLButton("Accept", `/application/${id}/state?state_id=6`), div);
    addPreset(createPresetURLButton("LE Approve", `/application/${id}/state?state_id=7`), div);
}

/**
 * Adds the super buttons to the page
 */
function handleSuperButtons() {
    const title = document.querySelector("h1").textContent;
    let parent;
    if (title === "Oops! We ran into some problems.") {
        parent = document.querySelector(".p-body-main");
        addSuperButtons(parent, false);
    } else {
        parent = document.querySelector("td>a.button-fix").parentNode;
        addSuperButtons(parent);
    }
}

/**
 * Changes the target of the application links to open in a new tab
 */
function handleApplicationPage() {
    try {
        for (const child of document.querySelector(".dataList-row > :nth-child(2)").childNodes) {
            if (child.nodeName !== "A")
                continue;
            child.setAttribute("target", "_blank");
        }
    } catch (error) { /* empty */ }
}

(function () {
    document.body.addEventListener("DOMNodeInserted", handleOnHold, false);
    handleApplicationPage();
    handleSuperButtons();
})();
