// ==UserScript==
// @name         EGO MS Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey/blob/master/EGO%20MS%20Enhancement.user.js
// @version      1.0.1
// @description  Add various enhancements & QOL additions to the EdgeGamers Forums that are beneficial for MS members.
// @author       Skle, MSWS
// @match        https://www.edgegamers.com/application/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @grant        none
// ==/UserScript==

/**
 * Adds a preset button to the div
 * @param {string} name Name of button
 * @param {HTMLDivElement} div Div to add to
 * @param {function(HTMLElementEventMap)} func Function to call on click
 */
function addPreset(name, div, func) {
    div.insertBefore(createPresetButton(name, func), div.childNodes[div.childNodes.length - 1]);
}

/**
 * Creates a preset button
 * @param {string} text Button text
 * @param {function(HTMLElementEventMap)} callback Function to call on click  
 * @returns {HTMLButtonElement} Button
 */
function createPresetButton(text, callback) {
    let button = document.createElement("span");
    button.classList.add("button");
    button.innerHTML = text;
    button.onclick = callback;
    button.style.marginLeft = "4px";
    button.style.marginTop = "4px";
    return button
}

/**
 * Adds "On Hold" templates to the menu and increases the size of the explain box.
 * @param {HTMLElementEventMap} event 
 * @returns void
 */
function handleOnHold(event) {
    if (event.target.nodeName != 'DIV' || !event.target.classList.contains('overlay-container'))
        return;

    // Event may fire twice - add a mark the first time it fires, and ignore the rest
    let mark = document.createElement('input');
    mark.type = 'hidden';
    event.target.append(mark);
    if (event.target.childNodes.length > 2)
        return;

    let body = event.target.querySelector('.overlay > .overlay-content > form > .block-container > .block-body');
    let reason = body.querySelector(':nth-child(1) > dd > input');
    let explain = body.querySelector(':nth-child(2) > dd > input');
    // Convert the explain input into a textarea
    explain.outerHTML = explain.outerHTML.replace('input', 'textarea');
    // Variable gets dereferenced - reference it again
    explain = body.querySelector(':nth-child(2) > dd > textarea');
    explain.style.height = '200px';
    explain.setAttribute('maxlength', '1024');
    let div = body.querySelector(':nth-child(4) > dd > div > .formSubmitRow-controls');

    addPreset("No MAUL account", div, function () {
        reason.value = "MAUL account must be created and verified";
        explain.value = "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\" \
then click the Sign in through Steam button under the Source ID section. Once you've done so, please reply to this post!"
    })

    addPreset("Steam Verification", div, function () {
        reason.value = "Steam account must be verified in MAUL";
        explain.value = "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\" \
then click the Sign in through Steam button under the Source ID section. Once you've done so, please reply to this post!"
    })

    addPreset("Minecraft Verification", div, function () {
        reason.value = "Minecraft ID must be verified in MAUL";
        explain.value = "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\" \
then under ID for Minecraft, input your Minecraft username, click Convert to Game ID, then log onto our Minecraft server. Once you've done so, please reply to this post!"
    })

    addPreset("Battlefield Verification", div, function () {
        reason.value = "Battlefield account must be verified in MAUL";
        explain.value = "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, in MAUL hover over the home link in the top left, \
click help, then follow the instructions for Battlefield. Once you have done so, please reply to this post!";
    })

    addPreset("Discord Verification", div, function () {
        reason.value = "Discord ID must be verfied in MAUL";
        explain.value = "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\" \
then click the sign in through Discord button under the discord ID section. Once you have done so, please reply to this post!"
    })

    addPreset("Inappropriate Name", div, function () {
        reason.value = "Inappropriate Name";
        explain.value = "As for your name, Please click [URL='https://www.edgegamers.com/account/username']here[/URL] and fill out a name change request. \
After you fill it out, please wait while your name change request is finalized and the change is completed. \
Once it is done your application process will resume. If you want to have an understanding on our naming policy inside of eGO please click [URL='https://www.edgegamers.com/threads/378540/']here[/URL].";
    });
}

/**
 * Changes the target of the application links to open in a new tab
 * @returns void
 */
function handleApplicationPage() {
    document.querySelector('.dataList-row > :nth-child(2)').childNodes[1].setAttribute('target', '_blank');
    document.querySelector('.dataList-row > :nth-child(2)').childNodes[3].setAttribute('target', '_blank');
}

(function () {
    document.body.addEventListener('DOMNodeInserted', handleOnHold, false);
    handleApplicationPage();
})();