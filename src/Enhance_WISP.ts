// ==UserScript==
// @name         EGO WISP Enhancement
// @namespace    https://github.com/MSWS/eGOMonkey
// @downloadURL  %DOWNLOAD%
// @version      %VERSION%
// @description  Helper script for WISP for permissions.
// @author       MSWS
// @match        https://wisp.edgegamers.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wisp.edgegamers.com
// @grant        none
// ==/UserScript==

const BUTTON_COOLDOWN = 1000; // 1 second

enum Perm {
    SUPPORT_OP_SUPER = 0,
    SUPPORT_OP,
    CONTROL_SUPER,
    CONTROL_CONSOLE,
    CONTROL_COMMANDS,
    CONTROL_START,
    CONTROL_STOP,
    CONTROL_RESTART,
    SUBUSER_SUPER,
    SUBUSER_READ,
    SUBUSER_EDIT,
    SUBUSER_CREATE,
    SUBUSER_DELETE,
    ALLOCATION_SUPER,
    ALLOCATION_READ,
    ALLOCATION_EDIT,
    STARTUP_SUPER,
    STARTUP_READ,
    STARTUP_EDIT,
    DATABASE_SUPER,
    DATABASE_READ,
    DATABASE_RESETPASSWORD,
    DATABASE_CREATE,
    DATABASE_DELETE,
    FILES_SUPER,
    FILES_SFTP,
    FILES_LIST,
    FILES_READ,
    FILES_EDIT,
    FILES_DELETE,
    FILES_ARCHIVE,
    FILES_GIT,
    SCHEDULE_SUPER,
    SCHEDULE_READ,
    SCHEDULE_EDIT,
    SCHEDULE_CREATE,
    SCHEDULE_DELETE,
    BACKUP_SUPER,
    BACKUP_READ,
    BACKUP_EDIT,
    BACKUP_CREATE,
    BACKUP_DELETE,
    BACKUP_DEPLOY,
    BACKUP_DOWNLOAD,
    DETAILS_SUPER,
    DETAILS_READ,
    DETAILS_EDIT,
    AUDIT_SUPER,
    AUDIT_READ,
    MODPACKS_SUPER,
    MODPACKS_READ,
    MODPACKS_EDIT,
    PLUGINS_SUPER,
    PLUGINS_READ,
    PLUGINS_EDIT,
    HEALTH_SUPER,
    HEALTH_READ,
    HEALTH_EDIT,
    REINSTALL_SUPER,
    REINSTALL_READ
}

const PERMS: { [key: string]: Perm[] } = {
    "Basic": [Perm.CONTROL_CONSOLE, Perm.CONTROL_START, Perm.HEALTH_READ],
    "Developer": [Perm.CONTROL_SUPER, Perm.ALLOCATION_READ, Perm.STARTUP_READ, Perm.FILES_SUPER, Perm.BACKUP_READ, Perm.DETAILS_READ, Perm.AUDIT_SUPER, Perm.HEALTH_READ],
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
            Perm.PLUGINS_SUPER,
            Perm.HEALTH_SUPER,
            Perm.REINSTALL_SUPER
        ]
};

/**
 * Creates a preset button
 *
 * @param {string} text Button text
 * @param {(MouseEvent) => void} callback Function to call on click
 * @returns {HTMLButtonElement} Button
 */
// eslint-disable-next-line no-unused-vars
function createWISPButton(text: string, callback: (e: MouseEvent) => void) {
    const button = document.createElement("button");
    button.innerText = text;
    button.onclick = callback;
    button.classList.add("btn", "btn-primary", "ml-5");

    return button;
}

/**
 * Generates a button assigning the proper permissions
 *
 * @param {string} perm Permission to assign
 * @param {HTMLFormElement} form Form to assign to
 * @returns {(e: MouseEvent) => void} Function to call on click
 */
function generateButtonEvent(perm: string, form: HTMLFormElement) {
    return (e: MouseEvent) => {
        if (!e.target)
            return;
        const inputs = form.querySelectorAll(".input[type='checkbox']") as NodeListOf<HTMLInputElement>;
        e.preventDefault();

        for (const index of PERMS.Super) {
            if (!inputs[index].checked)
                inputs[index].click();
            inputs[index].click();
        }

        (e.target as HTMLInputElement).disabled = true;
        setTimeout(() => { // WISP is terrible and I hate it so much
            for (const index of PERMS[perm].values()) {
                if (!inputs[index].checked)
                    inputs[index].click();
            }
        }, 1);
        setTimeout(() => {
            (e.target as HTMLInputElement).disabled = false;
        }, BUTTON_COOLDOWN);
    };
}

/**
 * Adds all permissions' preset buttons to the form
 *
 * @param {HTMLFormElement} form Form to add to
 * @param {HTMLElement} email Email element
 */
function addPresetButtons(form: HTMLFormElement, email: HTMLElement) {
    const presetsDiv = document.createElement("div");
    const presetLabel = document.createElement("label");
    presetLabel.textContent = "Presets";
    presetLabel.classList.add("text-white", "opacity-50", "tracking-wide", "uppercase", "block", "mb-3");
    presetsDiv.appendChild(presetLabel);

    email.appendChild(presetsDiv);
    for (const perm of Object.keys(PERMS))
        presetsDiv.appendChild(createWISPButton(perm, generateButtonEvent(perm, form)));
}

const permissionsPopupListener = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const target = mutation.target as HTMLElement;
        const childTarget = target.childNodes[0] as HTMLElement;
        const form = document.querySelector("form");
        if (target.nodeName !== "DIV" || !childTarget || !childTarget.classList || !childTarget.classList.contains("bg-black") || !childTarget.classList.contains("fixed"))
            continue;
        const email = form?.querySelector(".mb-4") as HTMLElement;
        if (!email || !form)
            continue;

        addPresetButtons(form, email);
        break;
    }
});


(function () {
    permissionsPopupListener.observe(document.body, { childList: true, subtree: true });
})();
