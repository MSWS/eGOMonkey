// ==UserScript==
// @name         EGO Ad Resize
// @namespace    https://github.com/MSWS/eGOMonkey
// @updateURL    https://raw.githubusercontent.com/MSWS/eGOMonkey/master/EGO%20Ad%20Resize.user.js
// @version      1.1.3
// @description  Removes whitespace left over from ads on the EdgeGamers website. This is to be used in combination with an adblocker (such as U-Block Origin).
// @author       blank_dvth, Skle, MSWS
// @match        https://www.edgegamers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edgegamers.com
// @grant        none
// ==/UserScript==

'use strict';

(function () {
    // Remove banners
    let banners = [...document.querySelectorAll("div[style$=\"height:90px;\"]")];
    banners.forEach(banner => {
        banner.remove();
    });

    // Remove sidebar
    let mainBody = document.querySelector("div .p-body-main--withSidebar");
    if (mainBody)
        mainBody.classList.replace("p-body-main--withSidebar", "p-body-main");
    let sideBar = document.querySelector(".p-body-sidebar");
    if (sideBar)
        sideBar.remove();
    let sideBarCol = document.querySelector(".p-body-sidebarCol");
    if (sideBarCol)
        sideBarCol.remove();
})();
