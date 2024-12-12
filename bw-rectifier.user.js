// ==UserScript==
// @name         Bw-rectifier
// @namespace    https://github.com/DeltaLib/Bw-rectifier
// @version      0.4
// @description  Add "Read" button to Bookwalker's "My Books" page
// @author       Altqx
// @match        https://bookwalker.jp/holdBooks/*
// @match        https://bookwalker.in.th/holdBooks/*
// @downloadURL  https://github.com/DeltaLib/Bw-rectifier/raw/main/bw-rectifier.user.js
// @updateURL    https://github.com/DeltaLib/Bw-rectifier/raw/main/bw-rectifier.user.js
// @icon         https://bookwalker.in.th/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addReadButton(bookBtnList) {
        const bookItem = bookBtnList.closest('.book-item');
        const bookLink = bookItem.querySelector('.book-tl-txt a');
        if (!bookBtnList.querySelector('.book-btn-item-full') || bookBtnList.querySelector('.book-btn-item-full').textContent.trim() === 'กรุณาอ่านอีบุ๊กนี้ด้วยแอป BOOK☆WALKER') {
            const isThaiSite = window.location.hostname === 'bookwalker.in.th';
            const bookUUID = bookLink.href.match(/bookwalker\.[a-z\.]+\/(?:de|)(.+?)\//)[1];

            if (isThaiSite) {
                const existingFullBtn = bookBtnList.querySelector('.book-btn-item-full');
                if (existingFullBtn) {
                    existingFullBtn.remove();
                }
            }

            const newListItem = document.createElement('li');
            newListItem.className = 'book-btn-item book-btn-item-full';
            if (isThaiSite) {
                newListItem.innerHTML = `<a href="https://member.bookwalker.jp/app/03/webstore/cooperation?r=BROWSER_VIEWER/${bookUUID}/https%3A%2F%2Fbookwalker.jp%2FholdBooks%2F" target="_blank" class="btn btn-gray btn-read  btn-block book-status-viewer" data-action-label="อ่านหนังสือเล่มนี้"><i class="ico ico-book-open"></i><span class="txt"><span class="str">อ่านหนังสือเล่มนี้</span></span></a>`;
            } else {
                newListItem.innerHTML = `<a href="https://member.bookwalker.jp/app/03/webstore/cooperation?r=BROWSER_VIEWER/${bookUUID}/https%3A%2F%2Fbookwalker.jp%2FholdBooks%2F" target="_blank" class="btn btn-gray btn-read  btn-block book-status-viewer" data-action-label="この本を読む"><i class="ico ico-book-open"></i><span class="txt"><span class="str">この本を読む</span></span></a>`;
            }
            bookBtnList.appendChild(newListItem);
        }
    }

    function initialize() {
        const bookLists = document.querySelectorAll('.md-book-list .book-btn-list');
        bookLists.forEach(addReadButton);
    
        setupObserver(document.querySelector('.md-book-list'));
    }

    function setupObserver(mdBookList) {
        if (!mdBookList) return;
    
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const bookBtnLists = node.querySelectorAll('.book-btn-list');
                            bookBtnLists.forEach(addReadButton);
                        }
                    });
                }
            });
        });
    
        observer.observe(mdBookList, { childList: true, subtree: true });
    }

    initialize();
})();
