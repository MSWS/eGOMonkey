// ==UserScript==
// @name         EGO WISP Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey
// @downloadURL  %DOWNLOAD%
// @version      %VERSION%
// @description  Helper script for WISP for permissions.
// @author       MSWS
// @match        https://wisp.edgegamers.io/*/subusers
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wisp.edgegamers.com
// @grant        none
// ==/UserScript==

"use strict";

const BUTTON_COOLDOWN = 1000; // 1 second

const Perm = {
    SUPPORT_OP_SUPER: 0,
    SUPPORT_OP: 1,
    CONTROL_SUPER: 2,
    CONTROL_CONSOLE: 3,
    CONTROL_COMMANDS: 4,
    CONTROL_START: 5,
    CONTROL_STOP: 6,
    CONTROL_RESTART: 7,
    SUBUSER_SUPER: 8,
    SUBUSER_READ: 9,
    SUBUSER_EDIT: 10,
    SUBUSER_CREATE: 11,
    SUBUSER_DELETE: 12,
    ALLOCATION_SUPER: 13,
    ALLOCATION_READ: 14,
    ALLOCATION_EDIT: 15,
    STARTUP_SUPER: 16,
    STARTUP_READ: 17,
    STARTUP_EDIT: 18,
    DATABASE_SUPER: 19,
    DATABASE_READ: 20,
    DATABASE_RESETPASSWORD: 21,
    DATABASE_CREATE: 22,
    DATABASE_DELETE: 23,
    FILES_SUPER: 24,
    FILES_SFTP: 25,
    FILES_LIST: 26,
    FILES_READ: 27,
    FILES_EDIT: 28,
    FILES_DELETE: 29,
    FILES_ARCHIVE: 30,
    FILES_GIT: 31,
    SCHEDULE_SUPER: 32,
    SCHEDULE_READ: 33,
    SCHEDULE_EDIT: 34,
    SCHEDULE_CREATE: 35,
    SCHEDULE_DELETE: 36,
    BACKUP_SUPER: 37,
    BACKUP_READ: 38,
    BACKUP_EDIT: 39,
    BACKUP_CREATE: 40,
    BACKUP_DELETE: 41,
    BACKUP_DEPLOY: 42,
    BACKUP_DOWNLOAD: 43,
    DETAILS_SUPER: 44,
    DETAILS_READ: 45,
    DETAILS_EDIT: 46,
    AUDIT_SUPER: 47,
    AUDIT_READ: 48,
    MODPACKS_SUPER: 49,
    MODPACKS_READ: 50,
    MODPACKS_EDIT: 51,
    PLUGINS_SUPER: 52,
    PLUGINS_READ: 53,
    PLUGINS_EDIT: 54,
    HEALTH_SUPER: 55,
    HEALTH_READ: 56,
    HEALTH_EDIT: 57,
    REINSTALL_SUPER: 58,
    REINSTALL_READ: 59
};

const PERMS = {
    "Developer": [Perm.CONTROL_SUPER, Perm.ALLOCATION_READ, Perm.STARTUP_READ, Perm.FILES_SUPER, Perm.BACKUP_READ, Perm.DETAILS_READ, Perm.AUDIT_SUPER, Perm.HEALTH_READ],
    "Basic": [Perm.CONTROL_CONSOLE, Perm.CONTROL_START, Perm.HEALTH_READ],
    "Super":
        [
            Perm.SUPPORT_OP_SUPER,
            Perm.CONTROL_SUPER,
            Perm.SUBUSER_SUPER,
            Perm.ALLOCATION_SUPER,
            Perm.STARTUP_SUPER,
            Perm.DATABASE_SUPER,
            Perm.FILES_SUPER,
            Perm.SCHEDULE_SUPER,
            Perm.BACKUP_SUPER,
            Perm.DETAILS_SUPER,
            Perm.AUDIT_SUPER,
            Perm.MODPACKS_SUPER,
            Perm.PLUGINS_SUPER
        ]
};

/**
 * Creates a preset button
 *
 * @param {string} text Button text
 * @param {function(Event)} callback Function to call on click
 * @returns {HTMLButtonElement} Button
 */
function createPresetButton(text, callback) {
    const button = document.createElement("button");
    button.innerText = text;
    button.onclick = callback;
    button.classList = "btn btn-primary ml-5";

    return button;
}

/**
 * Attaches preset buttons to the permissions popup
 *
 * @param {Event} event Event
 */
function permissionsPopupListener(event) {
    if (event.target.nodeName !== "DIV" || !event.target.classList.contains("bg-black") || !event.target.classList.contains("fixed"))
        return;
    const form = document.querySelector("form");
    const email = form.querySelector(".mb-4");

    const presetsDiv = document.createElement("div");
    const presetLabel = document.createElement("label");
    presetLabel.textContent = "Presets";
    presetLabel.classList = ["text-white opacity-50 tracking-wide uppercase block mb-3"];
    presetsDiv.appendChild(presetLabel);

    email.appendChild(presetsDiv);
    for (const perm of Object.keys(PERMS)) {
        const onPress = (e) => {
            const inputs = form.querySelectorAll(".input[type='checkbox']");
            e.preventDefault();

            for (const index of PERMS.Super) {
                if (!inputs[index].checked)
                    inputs[index].click();
                inputs[index].click();
            }

            e.target.disabled = true;
            setTimeout(() => { // WISP is terrible and I hate it so much
                for (const index of PERMS[perm]) {
                    if (!inputs[index].checked)
                        inputs[index].click();
                }
            }, 1);
            setTimeout(() => {
                e.target.disabled = false;
            }, BUTTON_COOLDOWN);
        };
        presetsDiv.appendChild(createPresetButton(perm, onPress));
    }
}

(function () {
    document.body.addEventListener("DOMNodeInserted", permissionsPopupListener, false);
})();
