// ==UserScript==
// @name         EGO MS Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey
// @downloadURL  %DOWNLOAD%
// @version      %VERSION%
// @description  Add various enhancements & QOL additions to the EdgeGamers Forums that are beneficial for MS members.
// @author       Skle, MSWS
// @match        https://www.edgegamers.com/application/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @grant        none
// ==/UserScript==

const POPUP_CHILDREN = 28; // How many children are in the "On Hold" popup

const REASONS = {
    "No MAUL":
        [
            "MAUL account must be created and verified",
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + " then click the Sign in through Steam button under the Source ID section. Once you've done so, please reply to this post!"
        ],
    "Steam ID":
        [
            "Steam account must be verified in MAUL",
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + " then click the Sign in through Steam button under the Source ID section. Once you've done so, please reply to this post!"
        ],
    "Minecraft ID":
        [
            "Minecraft ID must be verified in MAUL",
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + " then under ID for Minecraft, input your Minecraft username, click Convert to Game ID, then log onto our Minecraft server."
            + " Once you've done so, please reply to this post!"
        ],
    "Battlefield ID":
        [
            "Battlefield account must be verified in MAUL",
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar,"
            + " in MAUL hover over the home link in the top left,"
            + " click help, then follow the instructions for Battlefield. Once you have done so, please reply to this post!"
        ],
    "Discord ID":
        [
            "Discord ID must be verfied in MAUL",
            "In order for you to fix this you'll need to click the MAUL link at the top of the page in the navbar, click \"Edit Game IDs,\""
            + "then click the sign in through Discord button under the discord ID section. Once you have done so, please reply to this post!"
        ],
    "Name":
        [
            "Inappropriate Name",
            "As for your name, Please click [URL='https://www.edgegamers.com/account/username']here[/URL] and fill out a name change request."
            + " After you fill it out, please wait while your name change request is finalized and the change is completed."
            + " Once it is done your application process will resume. If you want to have an understanding on our naming"
            + " policy inside of eGO please click [URL='https://www.edgegamers.com/threads/378540/']here[/URL]."
        ]
};


/**
 * Adds a preset button to the div
 *
 * @param {HTMLButtonElement | HTMLSpanElement} button Button to add
 * @param {HTMLDivElement} div Div to add to
 * @param {boolean} before Whether to add the button before the last child
 */
function addMSPreset(button: HTMLButtonElement | HTMLSpanElement, div: HTMLDivElement, before = true) {
    if (before)
        div.insertBefore(button, div.childNodes[div.childNodes.length - 1]);
    else
        div.appendChild(button);
}

/**
 * Creates a preset button
 *
 * @param {string} text Button text
 * @param {(MouseEvent) => any} callback Function to call on click
 * @returns {HTMLSpanElement} Button
 */
// eslint-disable-next-line no-unused-vars
function createMSCallbackButton(text: string, callback: (e: MouseEvent) => void): HTMLSpanElement {
    const button = document.createElement("span");
    button.classList.add("button");
    button.textContent = text;
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
 * @returns {HTMLSpanElement} Generated button
 */
function createMSButton(text: string, url: string): HTMLSpanElement {
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
const handleOnHold = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const target = mutation.target as HTMLElement;
        if (mutation.target.nodeName !== "BODY")
            continue;
        if (!target.classList.contains("is-modalOpen") || !target.classList.contains("is-modalOverlayOpen"))
            continue;
        // Event may fire twice - add a mark the first time it fires, and ignore the rest
        if (target.childNodes.length > POPUP_CHILDREN)
            continue;
        const mark = document.createElement("input");
        mark.type = "hidden";
        target.append(mark);
        const body = document.querySelector(".overlay > .overlay-content > form > .block-container > .block-body");
        if (!body)
            continue;
        const reasonElement = body.querySelector(":nth-child(1) > dd > input") as HTMLTextAreaElement;
        let explain = body.querySelector(":nth-child(2) > dd > input") as HTMLTextAreaElement;
        if (!reasonElement || !explain)
            continue;
        // Convert the explain input into a textarea
        explain.outerHTML = explain.outerHTML.replace("input", "textarea");
        // Variable gets dereferenced - reference it again
        explain = body.querySelector(":nth-child(2) > dd > textarea") as HTMLTextAreaElement;
        explain.style.height = "200px";
        explain.setAttribute("maxlength", "1024");
        const div = body.querySelector(":nth-child(4) > dd > div > .formSubmitRow-controls") as HTMLDivElement;

        for (const [title, value] of Object.entries(REASONS)) {
            const reason = value[0];
            const desc = value[1];
            addMSPreset(createMSCallbackButton(title, function () {
                reasonElement.value = reason;
                explain.value = desc;
            }), div);
        }
    }
});

/**
 * Adds misc. MS buttons that are normally not shown
 *
 * @param {HTMLDivElement} div Div to add to
 * @param {boolean} access True if we have access to the page
 */
function addSuperButtons(div: HTMLDivElement, access = true) {
    const url = window.location.href;
    const id = url.substring(url.lastIndexOf("application/") + "application/".length).replace("/", "");
    let status;
    if (access)
        status = document.querySelector(".badge")?.textContent?.trim();

    addMSPreset(createMSButton("Deny", `/application/${id}/state?state_id=5`), div);
    if (access) {
        div.append(document.createElement("br"));
        div.appendChild(document.createElement("br"));
    }
    if (!access || status !== "Pending")
        addMSPreset(createMSButton("Set to Pending", `/application/${id}/state?state_id=2`), div);
    if (!access || status !== "On Hold" && status !== "Pending")
        addMSPreset(createMSButton("On Hold", `/application/${id}/state?state_id=3`), div);

    addMSPreset(createMSButton("Accept", `/application/${id}/state?state_id=6`), div);
    addMSPreset(createMSButton("LE Approve", `/application/${id}/state?state_id=7`), div);
}

/**
 * Adds the super buttons to the page
 */
function handleSuperButtons() {
    const title = document.querySelector("h1")?.textContent;
    const parent =
        (title === "Oops! We ran into some problems."
            ? document.querySelector(".p-body-main")
            : document.querySelector("td>a.button-fix")?.parentNode) as HTMLDivElement;
    if (!parent)
        return;
    addSuperButtons(parent, title !== "Oops! We ran into some problems.");
}

/**
 * Changes the target of the application links to open in a new tab
 */
function handleApplicationPage() {
    try {
        for (const child of (document.querySelector(".dataList-row > :nth-child(2)") as HTMLElement).childNodes) {
            if (child.nodeName !== "A")
                continue;
            (child as HTMLElement).setAttribute("target", "_blank");
        }
    } catch (error) { /* empty */ }
}

(function () {
    handleOnHold.observe(document.body, { childList: true, subtree: true });
    handleApplicationPage();
    handleSuperButtons();
})();
