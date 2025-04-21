// ==UserScript==
// @name         Bw-rectifier
// @namespace    https://github.com/altqx/BW-Rectifier
// @version      2.0.0
// @description  Replace "Archive" button with "Read" button on Bookwalker.in.th's new "My Books" page
// @author       Altqx
// @match        https://bookwalker.in.th/holdBooks*
// @downloadURL  https://github.com/altqx/BW-Rectifier/raw/main/bw-rectifier.user.js
// @updateURL    https://github.com/altqx/BW-Rectifier/raw/main/bw-rectifier.user.js
// @icon         https://bookwalker.in.th/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const ARCHIVE_BUTTON_TEXT = 'เก็บใส่คลัง';
    const READ_BUTTON_TEXT = 'อ่าน';
    const READ_BUTTON_CLASS = 'bw-read-button';

    // Function to create the "Read" button element
    function createReadButton(bookUUID) {
        const readLink = document.createElement('a');
        readLink.href = `https://member.bookwalker.jp/app/03/webstore/cooperation?r=BROWSER_VIEWER/${bookUUID}/https%3A%2F%2Fbookwalker.jp%2FholdBooks%2F`;
        readLink.target = '_blank';
        readLink.className = `border-2 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 px-4 py-2 rounded-full h-[38px] w-1/2 ${READ_BUTTON_CLASS}`; // Added w-1/2 to match archive button size
        readLink.innerHTML = `<span class="text-[14px] font-normal">${READ_BUTTON_TEXT}</span>`;
        return readLink;
    }

    function processBookItem(bookItemContainer) {
        const archiveButton = Array.from(bookItemContainer.querySelectorAll('button')).find(
            button => button.textContent.trim() === ARCHIVE_BUTTON_TEXT
        );

        if (!archiveButton || archiveButton.disabled) {
             const existingReadBtn = bookItemContainer.querySelector(`.${READ_BUTTON_CLASS}`);
             if (existingReadBtn) {
                 return;
             }
             return;
        }

        const bookLinkElement = bookItemContainer.querySelector('a[href^="/product/"]');
        if (!bookLinkElement) {
            console.warn('Could not find book link for item:', bookItemContainer);
            return;
        }

        const bookLink = bookLinkElement.href;
        const uuidMatch = bookLink.match(/\/product\/([a-f0-9-]+)/);
        if (!uuidMatch || !uuidMatch[1]) {
            console.warn('Could not extract UUID from link:', bookLink);
            return;
        }
        const bookUUID = uuidMatch[1];
        const readButton = createReadButton(bookUUID);
        console.log(`Replacing archive button with read button for UUID: ${bookUUID}`);
        archiveButton.replaceWith(readButton);
    }

    function processAllBooks() {
        const bookContainers = document.querySelectorAll('div.text-white.rounded-lg.w-full.flex.flex-col, div.text-white.rounded-lg.w-full.flex.sm\\:flex-row');

        if(bookContainers.length === 0) {
            const anyArchiveButton = document.querySelector(`button:not(.${READ_BUTTON_CLASS.replace('.', '')})`);
            if (anyArchiveButton && anyArchiveButton.textContent.trim() === ARCHIVE_BUTTON_TEXT) {
                 console.log("Using fallback");
                 const potentialContainers = document.querySelectorAll('button');
                 potentialContainers.forEach(button => {
                     if (button.textContent.trim() === ARCHIVE_BUTTON_TEXT && !button.closest(`.${READ_BUTTON_CLASS}`)) {
                         const container = button.closest('.flex.flex-col.justify-between')?.parentElement;
                         if (container) {
                             processBookItem(container);
                         } else {
                            const commonAncestor = button.closest('div:has(a[href^="/product/"])');
                            if (commonAncestor && !commonAncestor.querySelector(`.${READ_BUTTON_CLASS}`)) {
                                processBookItem(commonAncestor);
                            }
                         }
                     }
                 });
                 return;
            }
        }


        bookContainers.forEach(container => {
             if (container.querySelector('a[href^="/product/"]')) {
                 processBookItem(container);
             }
        });
    }

    // --- MutationObserver Logic ---
    const mutationCallback = (mutationsList, observer) => {
        let processed = false;
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches('div.text-white.rounded-lg.w-full.flex.flex-col, div.text-white.rounded-lg.w-full.flex.sm\\:flex-row') && node.querySelector('a[href^="/product/"]')) {
                           processBookItem(node);
                           processed = true;
                        }
                        // Check if the node *contains* book containers (e.g., a list was added)
                        const newContainers = node.querySelectorAll('div.text-white.rounded-lg.w-full.flex.flex-col, div.text-white.rounded-lg.w-full.flex.sm\\:flex-row');
                        newContainers.forEach(container => {
                           if (container.querySelector('a[href^="/product/"]')) {
                                processBookItem(container);
                                processed = true;
                           }
                        });
                        // Check if the node contains the specific button we are looking for
                        const newButtons = node.querySelectorAll ? node.querySelectorAll('button') : [];
                         newButtons.forEach(button => {
                             if (button.textContent.trim() === ARCHIVE_BUTTON_TEXT) {
                                 const commonAncestor = button.closest('div:has(a[href^="/product/"])');
                                 if (commonAncestor && !commonAncestor.querySelector(`.${READ_BUTTON_CLASS}`)) {
                                     processBookItem(commonAncestor);
                                     processed = true;
                                 }
                             }
                         });
                    }
                });
            } else if (mutation.type === 'attributes' && mutation.target.tagName === 'BUTTON' && mutation.target.textContent.trim() === ARCHIVE_BUTTON_TEXT) {
                // Sometimes buttons might be added then enabled, or attributes change. Re-check.
                 const commonAncestor = mutation.target.closest('div:has(a[href^="/product/"])');
                 if (commonAncestor && !commonAncestor.querySelector(`.${READ_BUTTON_CLASS}`)) {
                     processBookItem(commonAncestor);
                     processed = true;
                 }
            }
        }
    };

    const observer = new MutationObserver(mutationCallback);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'class']
     });
     processAllBooks();
})();
