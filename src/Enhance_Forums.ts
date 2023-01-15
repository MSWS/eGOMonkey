// ==UserScript==
// @name         EGO Forum Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey
// @downloadURL  %DOWNLOAD%
// @version      %VERSION%
// @description  Add various enhancements & QOL additions to the EdgeGamers Forums that are beneficial for Leadership members.
// @author       blank_dvth, Skle, MSWS
// @match        https://www.edgegamers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @require      https://raw.githubusercontent.com/12pt/steamid-converter/master/js/converter-min.js
// @grant        none
// ==/UserScript==

// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
declare var SteamIDConverter: any;

const MAUL_BUTTON_TEXT = "MAUL"; // Name of the MAUL button
const MAUL_INSERT_AFTER = 3; // Index for MAUL dropdown menu in NAV
const MAUL_NAV_MAUL_INDEX = 11; // Nav index to start inserting into
const BREADCRUMBS_INDEX = 2; // Breadcrumbs offset

const FORUMS = {
    BF_LEADERSHIP: 1260,
    CONTACT_LEADERSHIP: "contact-leadership",
    CONTEST_COMPLETED: 1236,
    CS_LEADERSHIP: 1261,
    DODS_LEADERSHIP: 1262,
    GTA_LEADERSHIP: 1316,
    LEADERSHIP_COMPLETED: 853,
    LEADERSHIP_DISCUSSION: 695,
    MC_LEADERSHIP: 1264,
    MODERATOR_TRASH: 685,
    TECH_LEADERSHIP: 1128,
    OW_LEADERSHIP: 1376,
    PLAYER_REPORT_COMPLETED: 1235,
    PLAYER_REPORT: 1233,
    RUST_LEADERSHIP: 1366,
    TF2_LEADERSHIP: 1265
};

/**
 * Creates a button and adds it to the given div
 *
 * @param {string} href URL that button should link to
 * @param {string} text Buttons' text
 * @param {HTMLDivElement} div Div to add/append to
 * @param {string} target Meta target for button
 * @param {boolean} append True to append, false to insert
 */
function createForumsButton(href: string, text: string, div: HTMLDivElement, target = "_blank", append = false) {
    const button = document.createElement("a");
    button.href = href;
    button.target = target;
    button.classList.add("button--link", "button");

    const buttonText = document.createElement("span"); // Create button text
    buttonText.classList.add("button-text");
    buttonText.innerHTML = text;

    // Add all elements to their respective parents
    button.appendChild(buttonText);
    append ? div.appendChild(button) : div.insertBefore(button, div.lastElementChild);
}

/**
 * Adds a MAUL profile button to the given div
 *
 * @param {HTMLDivElement} div Div to add to
 * @param {number} memberId Member's ID
 */
function addMAULProfileButton(div: HTMLDivElement, memberId: string | number) {
    createForumsButton("https://maul.edgegamers.com/index.php?page=home&id=" + memberId, MAUL_BUTTON_TEXT, div);
}

/**
 * Adds a "List Bans" button to the div
 *
 * @param {HTMLDivElement} div Div to add to
 * @param {number} steam64 Steam ID to check
 * TODO: Add support for other game IDs
 */
function addBansButton(div: HTMLDivElement, steam64: string) { createForumsButton(`https://maul.edgegamers.com/index.php?page=bans&qType=gameId&q=${steam64}`, "List Bans", div); }

/**
 * Adds a "Lookup ID" button to the div
 *
 * @param {HTMLDivElement} div Div to add to
 * @param {number} postTitle Steam ID to lookup
 */
function addLookupButton(div: HTMLDivElement, postTitle: string) {
    const steamUnknown = postTitle.match(/^.* - .* - (?<game_id>[\w\d/[\]\-.:]*)$/);
    createForumsButton(`https://steamid.io/lookup/${steamUnknown?.groups?.game_id}`, "Lookup ID", div);
}

/**
 * Adds a Move button to the div {@see handleThreadMovePage}
 *
 * @param {HTMLDivElement} div Div to add to
 * @param {string} url URL to move to
 * @param {string} text Text for the button
 * @param {string} id Movement ID, this is a parameter in the URL that is used to determine where to move in the movement handling page
 */
function addMoveButton(div: HTMLDivElement, url: string, text = "Move to Completed", id = "to_completed") {
    const postId = url.match(/threads\/(?<post_id>\d+)/);
    createForumsButton(`https://www.edgegamers.com/threads/${postId?.groups?.post_id}/move?move_${id}`, text, div, "_self");
}

/**
 * Adds a NAV item to the website's nav bar
 *
 * @param {string} href URL to link to
 * @param {string} text Text for button
 * @param {HTMLElement} nav Nav to add to
 */
function addForumNav(href: string, text: string, nav: HTMLElement) {
    const li = document.createElement("li"), div = document.createElement("div"), a = document.createElement("a");
    a.href = href;
    a.innerHTML = text;
    a.target = "_blank";
    a.classList.add("p-navEl-link");
    div.classList.add("p-navEl");
    div.appendChild(a);
    li.appendChild(div);
    nav.insertBefore(li, nav.childNodes[nav.childNodes.length - MAUL_INSERT_AFTER]);
}

/**
 * Adds dropdown options for MAUL specifically
 *
 * @param {HTMLElement} navList Site's navbar
 */
function addMAULNav(navList: HTMLUListElement) {
    // MAUL DIV
    const maulDiv = navList.childNodes[MAUL_NAV_MAUL_INDEX].childNodes[1] as HTMLDivElement;
    maulDiv.setAttribute("data-has-children", "true");
    const dropdown = document.createElement("a");

    dropdown.setAttribute("data-xf-key", "3");
    dropdown.setAttribute("data-xf-click", "menu");
    dropdown.setAttribute("data-menu-pos-ref", "< .p-navEl");
    dropdown.setAttribute("class", "p-navEl-splitTrigger");
    dropdown.setAttribute("role", "button");
    dropdown.setAttribute("tabindex", "0");
    dropdown.setAttribute("aria-label", "Toggle expanded");
    dropdown.setAttribute("aria-expanded", "false");
    dropdown.setAttribute("aria-haspopup", "true");

    maulDiv.append(dropdown);

    const maulDropdown = document.createElement("div");
    maulDropdown.setAttribute("class", "menu menu--structural");
    maulDropdown.setAttribute("data-menu", "menu");
    maulDropdown.setAttribute("aria-hidden", "true");

    const dropdownhtml =
        "<div class=\"menu-content\"> <a href=\"https://maul.edgegamers.com/index.php?page=bans\" target=\"_blank\""
        + " class=\"menu-linkRow u-indentDepth0 js-offCanvasCopy \" data-nav-id=\"maulBans\">Bans</a>"
        + " <a href=\"https://maul.edgegamers.com/index.php?page=users\" target=\"_blank\" class=\"menu-linkRow"
        + " u-indentDepth0 js-offCanvasCopy \" data-nav-id=\"newProfilePosts\">Users</a> <hr class=\"menu-separator\"> </div>";

    maulDropdown.innerHTML = dropdownhtml;
    maulDiv.append(maulDropdown);
}

/**
 * Generates large, transparent text (basically a watermark)
 *
 * @param {string} top CSS Top Style
 * @param {string} str Text to display
 */
function generateRedText(top: string, str = "Confidential") {
    const text = document.createElement("div");
    document.body.appendChild(text);

    text.innerHTML = str;
    text.style.color = "rgba(255,0,0,0.25)";
    text.style.fontSize = "100px";
    text.style.position = "fixed";
    text.style.top = top;
    text.style.left = "50%";
    text.style.transform = "translateX(-50%)";
    text.style.pointerEvents = "none";
    text.style.zIndex = "999";
}

/**
 * Listens to and appends MAUL button when user hovers over a profile
 *
 * @param {Event} event Event that was called
 */

const profileTooltipListener = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (!mutation.target)
            continue;
        const target = mutation.target as HTMLElement;
        // Make sure this specific event is the node we want
        if (target.nodeName !== "DIV" || !target.classList.contains("tooltip-content"))
            continue;

        // The buttongroup containing the "Follow" button
        const buttonGroupOne = target.querySelector(".memberTooltip > .memberTooltip-actions > :nth-child(1)") as HTMLElement;
        if (!buttonGroupOne)
            continue;
        buttonGroupOne.querySelector("a")?.href.match(/^https:\/\/www\.edgegamers\.com\/members\/(\d+)\/follow$/);
        const matches = buttonGroupOne.querySelector("a")?.href.match(/^https:\/\/www\.edgegamers\.com\/members\/(\d+)\/follow$/);
        // Make sure matches were found, exit gracefully if not.
        if (!matches)
            continue;

        const id = matches[1];
        // The buttongroup containing the "Start conversation" button
        const buttonGroupTwo = target.querySelector(".memberTooltip > .memberTooltip-actions > :nth-child(2)");
        // If the user is banned, buttonGroupTwo will be null. Default to buttonGroupOne.
        createForumsButton("https://maul.edgegamers.com/index.php?page=home&id=" + id, MAUL_BUTTON_TEXT, (buttonGroupTwo ?? buttonGroupOne) as HTMLDivElement, "_blank", true);
    }
});

/**
 * Moves and auto-fills out the moving prompt for a thread.
 */
function handleThreadMovePage() {
    const url = window.location.href;
    if (!url.endsWith("?move_to_completed"))
        return;
    let breadcrumbs: string | undefined | string[] = document.querySelector(".p-breadcrumbs")?.textContent?.trim().split("\n\n\n\n\n\n");
    if (!breadcrumbs)
        return;
    breadcrumbs = breadcrumbs[breadcrumbs.length - BREADCRUMBS_INDEX];
    if (!breadcrumbs)
        return;
    if (breadcrumbs.match(/^(Contest a Ban)|(Report a Player)$/)) { // Ban Contest or Report (Non-Completed)
        const form = document.forms[1];
        const drop = form.querySelector("select.js-nodeList") as HTMLSelectElement;
        const checkArr = Array.from(form.querySelectorAll(".inputChoices-choice"));
        const optArr = Array.from(drop?.options);
        const forumId = breadcrumbs.startsWith("Contest") ? FORUMS.CONTEST_COMPLETED : FORUMS.PLAYER_REPORT_COMPLETED;
        const index = optArr.find(el => el.value === forumId.toString());
        if (!index)
            return;
        drop.selectedIndex = optArr.indexOf(index);
        if (drop.selectedIndex === -1)
            throw "Could not find Completed forum";
        try { // These buttons may not exist if you created the post yourself, this is just to prevent edge cases.
            (checkArr.find(el => el.textContent === "Notify members watching the destination forum")?.querySelector("label > input") as HTMLInputElement).checked = false;
            (checkArr.find(el => el.textContent?.startsWith("Notify thread starter of this action."))?.querySelector("label > input") as HTMLInputElement).checked = false;
        } catch { /* empty */ }
        form.submit();
    }
}

/**
 * Checks if a given breadcrumbs string contains LE threads
 *
 * @param {string} str Breadcrumb string to check
 * @returns {boolean} true if LE, false otherwise
 */
function isLeadership(str: string) {
    const matches = str.match(/(Leadership|Report a Player|Report Completed)/);

    return matches && matches.length > 0;
}

/**
 * Adds misc. threads to main thread list
 */
function handleForumsList() {
    const privateCategory = document.querySelector(".block--category1240 > .block-container > .block-body");
    if (!privateCategory)
        return;
    const subforum = document.createElement("div");
    subforum.classList.add("node", "node--forum", "node--id685");

    const forumHtml = document.createElement("html");
    fetch(`https://www.edgegamers.com/forums/${FORUMS.MODERATOR_TRASH}/`).then(function (response) {
        response.text().then(function (text) {
            forumHtml.innerHTML = text;
            const thread = forumHtml.querySelector(".js-threadList > :first-child");
            if (!thread)
                return;
            // If the last thread in the bin is unread, mark the forum as unread
            if (thread.classList.contains("is-unread"))
                subforum.classList.add("node--unread");

            const userHref = thread.querySelector(".structItem-cell--latest > .structItem-minor > a");
            const threadTitle = thread.querySelector(".structItem-cell--main > .structItem-title > a");
            if (!threadTitle)
                return;
            let titleHtml = threadTitle.outerHTML;
            if (threadTitle.classList.contains("labelLink"))
                titleHtml += " " + thread.querySelector(".structItem-cell--main > .structItem-title > :nth-child(2)")?.outerHTML;

            const date = thread.querySelector(".structItem-cell--latest > a > time");
            const icon = thread.querySelector(".structItem-cell--icon.structItem-cell--iconEnd > .structItem-iconContainer > a");

            subforum.innerHTML =
                "<div class=\"node-body\"> <span class=\"node-icon\" aria-hidden=\"true\"> <i class=\"fa--xf far fa-comments\" aria-hidden=\"true\"></i>"
                + " </span> <div class=\"node-main js-nodeMain\"> <h3 class=\"node-title\"> <a href=\"/forums/685/\" data-xf-init=\"element-tooltip\""
                + " data-shortcut=\"node-description\" id=\"js-XFUniqueId87\">Moderator Trash Bin</a> </h3> <div class=\"node-description node-description--tooltip"
                + " js-nodeDescTooltip\">Planes, Trains, and Plantains</div> <div class=\"node-meta\"> <div class=\"node-statsMeta\"> <dl class=\"pairs pairs--inline\">"
                + " <dt>Threads</dt> <dd>18.2K</dd> </dl> <dl class=\"pairs pairs--inline\"> <dt>Messages</dt> <dd>69.6K</dd> </dl> </div> </div>"
                + " <div class=\"node-subNodesFlat\"> <span class=\"node-subNodesLabel\">Sub-forums:</span> </div> </div> <div class=\"node-stats\">"
                + " <dl class=\"pairs pairs--rows\"> <dt>Threads</dt> <dd>18.1K</dd> </dl> <dl class=\"pairs pairs--rows\"> <dt>Messages</dt> <dd>98.4K</dd>"
                + `</dl> </div> <div class="node-extra"> <div class="node-extra-icon">${icon?.outerHTML}</div> <div class="node-extra-row">${titleHtml}`
                + `</div> <div class="node-extra-row"> <ul class="listInline listInline--bullet"> <li>${date?.outerHTML}</li> <li class="node-extra-user">`
                + `${userHref?.outerHTML}</li> </ul> </div> </div> </div>`;
            privateCategory.appendChild(subforum);
        });
    });
}

/**
 * Adds "View Bans" or "Lookup ID" button on report/contest threads.
 */
function handleBanReport() {
    const breadcrumbs = (document.querySelector(".p-breadcrumbs") as HTMLElement).innerText;
    const postTitle = (document.querySelector(".p-title") as HTMLElement).innerText;
    const buttonGroup = document.querySelector("div.buttonGroup") as HTMLDivElement;
    const url = (document.querySelector(".message-name > a.username") as HTMLLinkElement).href;
    if (!url) return; // Listing page, not a specific report/contest
    addMAULProfileButton(buttonGroup, url.substring(url.indexOf("members/") + "members/".length));

    const steamId = postTitle.match(/^.* - .* - ([^\d]*?(?<game_id>(\d+)|(STEAM_\d:\d:\d+)|(\[U:\d:\d+\])).*)$/);
    const dashes = postTitle.split(" - ").length;
    if (steamId) {
        const unparsed = steamId.groups?.game_id;
        try {
            const steam64 = (SteamIDConverter.isSteamID64(unparsed) ? unparsed : SteamIDConverter.toSteamID64(unparsed));
            addBansButton(buttonGroup, steam64);
        } catch (TypeError) {
            addBansButton(buttonGroup, postTitle.split(" - ")[dashes - 1]);
            addLookupButton(buttonGroup, postTitle);
        }
    } else {
        addBansButton(buttonGroup, postTitle.split(" - ")[dashes - 1]);
        addLookupButton(buttonGroup, postTitle);
    }

    if (!breadcrumbs.match(/Completed ?$/))
        addMoveButton(buttonGroup, window.location.href);
}

/**
 * Adds Confidential banners on top and bottom of page
 */
function handleLeadership() {
    generateRedText("5%");
    generateRedText("80%");
}

/**
 * Handles generic/nonspecific threads
 */
function handleGenericThread() {
    const breadcrumbs = (document.querySelector(".p-breadcrumbs") as HTMLElement).innerText;
    if (breadcrumbs.match(/((Contest (a Ban|Completed))|(Report (a Player|Completed))) ?$/)) // Ban Contest or Report
        handleBanReport();

    let le = isLeadership(breadcrumbs);

    if (!le) {
        let threadString = window.location.pathname.substring("/forums/".length);
        if (threadString.endsWith("/"))
            threadString = threadString.substring(0, threadString.length - 1);
        le = Object.values(FORUMS).some((forum) => forum !== FORUMS.CONTEST_COMPLETED && threadString === forum.toString());
    }

    if (le) // LE Forums
        handleLeadership();
}

(function () {
    // Determine what page we're on
    const url = window.location.href;

    profileTooltipListener.observe(document.body, { childList: true, subtree: true });

    // Add Helpful Links to the Navigation Bar
    const navList = document.querySelector(".p-nav-list") as HTMLUListElement;
    addMAULNav(navList);

    addForumNav("https://gitlab.edgegamers.io/", "GitLab", navList);
    addForumNav("https://edgegamers.gameme.com/", "GameME", navList);

    if (url.match(/^https:\/\/www\.edgegamers\.com\/members\/\d+/))  // Members Page
        addMAULProfileButton(document.querySelector(".memberHeader-buttons") as HTMLDivElement, window.location.pathname.substring("/members/".length));

    if (url.match(/^https:\/\/www\.edgegamers\.com\/threads\/\d+\/move(?:\?move_.*)?$/))  // Thread Move Page
        handleThreadMovePage();

    if (url.match(/^https:\/\/www\.edgegamers\.com\/forums\/?$/))  // Forums List
        handleForumsList();

    handleGenericThread();
})();
