// ==UserScript==
// @name         EdgeGamers LE Enhancement
// @namespace    https://github.com/blankdvth/eGOScripts
// @version      2.1
// @description  Add various enhancements & QOL additions to the EdgeGamers Forums that are beneficial for Leadership members.
// @author       blank_dvth
// @match        https://www.edgegamers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @require      https://peterolson.github.io/BigInteger.js/BigInteger.min.js
// @require      https://raw.githubusercontent.com/12pt/steamid-converter/master/js/converter-min.js
// @grant        none
// ==/UserScript==

'use strict';

function create_button(href, text, div, target="_blank", append=false) {
    var button = document.createElement("a");
    button.href = href;
    button.target = target;
    button.classList.add('button--link', 'button');

    var button_text = document.createElement("span"); // Create the MAUL Profile button text
    button_text.classList.add('button-text');
    button_text.innerHTML = text;

    // Add all elements to their respective parents
    button.appendChild(button_text);
    append ? div.appendChild(button, div.lastElementChild) : div.insertBefore(button, div.lastElementChild);   
}

function add_maul_profile_button(div, member_id) { create_button("https://maul.edgegamers.com/index.php?page=home&id=" + member_id, "MAUL Profile", div); }

function add_bans_button(div, steam_id_64) { create_button("https://maul.edgegamers.com/index.php?page=bans&qType=gameId&q=" + steam_id_64, "List Bans", div); }

function add_lookup_button(div, post_title) {
    var steam_id_unknown = post_title.match(/^.* - .* - (?<game_id>[\w\d\/\[\]\-\.:]*)$/);
    if (steam_id_unknown) {
        create_button("https://steamid.io/lookup/" + steam_id_unknown.groups.game_id, "Lookup ID", div);
    }
}

function add_move_button(div, url) {
    var post_id = url.match(/threads\/(?<post_id>\d+)/)
    if (post_id) {
        create_button("https://www.edgegamers.com/threads/" + post_id.groups.post_id + "/move?move_to_completed", "Move to Completed", div, "_self");
    }
}

function add_nav(href, text, nav) {
    var li = document.createElement("li");
    var div = document.createElement("div");
    var a = document.createElement("a");
    a.href = href;
    a.innerHTML = text;
    a.target = "_blank";
    a.classList.add("p-navEl-link")
    div.classList.add("p-navEl")
    div.appendChild(a);
    li.appendChild(div);
    nav.insertBefore(li, nav.childNodes[nav.childNodes.length - 5]);
}

function add_maul_nav(nav_list) {
    // MAUL DIV
    var maul_div = nav_list.childNodes[11].childNodes[1]
    maul_div.setAttribute('data-has-children', 'true');
    var dropdown = document.createElement("a");

    // i hate this
    dropdown.setAttribute('data-xf-key', '3');
    dropdown.setAttribute('data-xf-click', 'menu');
    dropdown.setAttribute('data-menu-pos-ref', '< .p-navEl');
    dropdown.setAttribute('class', 'p-navEl-splitTrigger');
    dropdown.setAttribute('role', 'button');
    dropdown.setAttribute('tabindex', '0');
    dropdown.setAttribute('aria-label', 'Toggle expanded');
    dropdown.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-haspopup', 'true');

    maul_div.append(dropdown);

    var maul_dropdown = document.createElement("div");
    maul_dropdown.setAttribute('class', 'menu menu--structural');
    maul_dropdown.setAttribute('data-menu', 'menu');
    maul_dropdown.setAttribute('aria-hidden', 'true');

    var dropdownhtml = '<div class="menu-content"> \
    <a href="https://maul.edgegamers.com/index.php?page=bans" target="_blank" class="menu-linkRow u-indentDepth0 js-offCanvasCopy " data-nav-id="maulBans">Bans</a> \
    <a href="https://maul.edgegamers.com/index.php?page=users" target="_blank" class="menu-linkRow u-indentDepth0 js-offCanvasCopy " data-nav-id="newProfilePosts">Users</a> \
    <hr class="menu-separator"> \
    </div>'

    maul_dropdown.innerHTML = dropdownhtml;
    maul_div.append(maul_dropdown);
}

function handle_new_child(event) {
    // Make sure this specific event is the node we want
    if(event.target.nodeName != 'DIV' || !event.target.classList.contains('tooltip-content-inner')) {
        return;
    }
    // The buttongroup containing the "Follow" button
    var buttenGroupOne = event.target.querySelector('.memberTooltip > .memberTooltip-actions > :nth-child(1)');
    buttenGroupOne.querySelector('a').href.match(/^https:\/\/www\.edgegamers\.com\/members\/(\d+)\/follow$/);
    var matches = buttenGroupOne.querySelector('a').href.match(/^https:\/\/www\.edgegamers\.com\/members\/(\d+)\/follow$/);
    // Make sure matches were found, exit gracefully if not.
    if(matches) {
        var id = matches[1];
    }
    else {
        return;
    } 
    // The buttongroup containing the "Start conversation" button
    var buttonGroupTwo = event.target.querySelector('.memberTooltip > .memberTooltip-actions > :nth-child(2)');
    // If the user is banned, buttonGroupTwo will be null. Default to buttonGroupOne.
    create_button("https://maul.edgegamers.com/index.php?page=home&id=" + id, "MAUL Profile", buttonGroupTwo == null ? buttenGroupOne : buttonGroupTwo, "_blank", true);
}

(function() {
    // Determine what page we're on
    var url = window.location.href;

    document.body.addEventListener('DOMNodeInserted', handle_new_child, false);

    // Add Helpful Links to the Navigation Bar
    var nav_list = document.querySelector(".p-nav-list");
    //add_nav("https://maul.edgegamers.com/index.php?page=bans", "Bans", nav_list);
    add_maul_nav(nav_list);

    add_nav("https://gitlab.edgegamers.io/", "GitLab", nav_list);
    add_nav("https://edgegamers.gameme.com/", "GameME", nav_list);

    if (url.match(/^https:\/\/www\.edgegamers\.com\/members\/\d+/)) { // Members Page
        add_maul_profile_button(document.querySelector(".memberHeader-buttons"), window.location.pathname.substring(9));
    } else if (url.match(/^https:\/\/www\.edgegamers\.com\/threads\/\d+\/move(?:\?move_.*)?$/)) { // Thread Move Page
        if (url.endsWith("?move_to_completed")) {
            var breadcrumbs = document.querySelector(".p-breadcrumbs").textContent.trim().split("\n\n\n\n\n\n");
            breadcrumbs = breadcrumbs[breadcrumbs.length - 2];
            if (breadcrumbs.match(/^(Contest a Ban)|(Report a Player)$/)) { // Ban Contest or Report (Non-Completed)
                const CONTEST_COMPLETED = 1236;
                const REPORT_COMPLETED = 1235;
                var form = document.forms[1];
                var drop = form.querySelector("select.js-nodeList");
                var checkArr = Array.from(form.querySelectorAll(".inputChoices-choice"));
                var optArr = Array.from(drop.options);
                drop.selectedIndex = optArr.indexOf(optArr.find(el => el.value == (breadcrumbs.startsWith("Contest") ? CONTEST_COMPLETED : REPORT_COMPLETED)));
                if (drop.selectedIndex == -1) {
                    throw "Could not find Completed forum";
                }
                try { // These buttons may not exist if you created the post yourself, this is just to prevent edge cases.
                    checkArr.find(el => el.textContent === "Notify members watching the destination forum").querySelector("label > input").checked = false;
                    checkArr.find(el => el.textContent.startsWith("Notify thread starter of this action.")).querySelector("label > input").checked = false;
                } catch {}
                form.submit();
            }
        }
    } else if (url.match(/^https:\/\/www\.edgegamers\.com\/threads\/\d+/)) { // Forum Thread of Some Sort
        var breadcrumbs = document.querySelector(".p-breadcrumbs").innerText;
        var post_title = document.querySelector(".p-title").innerText;

        if (breadcrumbs.match(/((Contest (a Ban|Completed))|(Report (a Player|Completed))) ?$/)) { // Ban Contest or Report
            var button_group = document.querySelector("div.buttonGroup");
            add_maul_profile_button(button_group, document.querySelector(".message-name > a.username").href.substring(35));

            var steam_id = post_title.match(/^.* - .* - ([^\d]*?(?<game_id>(\d+)|(STEAM_\d:\d:\d+)|(\[U:\d:\d+\])).*)$/)
            if (steam_id) {
                var unparsed_id = steam_id.groups.game_id;
                try {
                    var steam_id_64 = (SteamIDConverter.isSteamID64(unparsed_id) ? unparsed_id : SteamIDConverter.toSteamID64(unparsed_id));
                    add_bans_button(button_group, steam_id_64);
                } catch (TypeError) {
                    add_lookup_button(button_group, post_title);
                }
            } else {
                add_lookup_button(button_group, post_title);
            }

            if (!breadcrumbs.match(/Completed ?$/)) {
                add_move_button(button_group, url)
            }
        } else if (breadcrumbs.match(/Leadership/)) { // LE Forums
            var watermarkTop = document.createElement("div");
            document.getElementsByTagName("body")[0].appendChild(watermarkTop);

            watermarkTop.innerHTML = "Confidential";
            watermarkTop.style.color = "rgba(255,0,0,0.15)";
            watermarkTop.style.fontSize = "100px";
            watermarkTop.style.position = "fixed";
            watermarkTop.style.top = "1%";
            watermarkTop.style.left = "50%";
            watermarkTop.style.transform = "translateX(-50%)"
            watermarkTop.style.pointerEvents = "none";
            watermarkTop.style.zIndex = "999";

            var watermarkBottom = document.createElement("div");
            document.getElementsByTagName("body")[0].appendChild(watermarkBottom);

            watermarkBottom.innerHTML = "Confidential";
            watermarkBottom.style.color = "rgba(255,0,0,0.15)";
            watermarkBottom.style.fontSize = "100px";
            watermarkBottom.style.position = "fixed";
            watermarkBottom.style.top = "85%";
            watermarkBottom.style.left = "50%";
            watermarkBottom.style.transform = "translateX(-50%)"
            watermarkBottom.style.pointerEvents = "none";
            watermarkBottom.style.zIndex = "999";
        }
    } else if (url.match(/^https:\/\/www\.edgegamers\.com\/forums\/?$/)) { // Forums List
        // Adds the Moderator Trash Bin to the Private Forums section
        var private_category = document.querySelector(".block--category1240 > .block-container > .block-body");
        var subforum = document.createElement("div");
        subforum.classList.add("node", "node--forum", "node--id685");
        subforum.innerHTML = "<div class=\"node-body\"><span class=\"node-icon\"><i class=\"fa--xf far fa-comments\" aria-hidden=\"true\"></i></span><div class=\"node-main js-nodeMain\"><h3 class=\"node-title\"><a href=\"/forums/685/\" data-xf-init=\"element-tooltip\" data-shortcut=\"node-description\">Moderator Trash Bin</a></h3></div><div class=\"node-extra\"><span class=\"node-extra-placeholder\">Planes, Trains, and Plantains</span></div></div>";
        private_category.appendChild(subforum);
    }
})();