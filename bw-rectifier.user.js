// ==UserScript==
// @name         Bw-rectifier
// @namespace    https://github.com/DeltaLib/Bw-rectifier
// @version      1.0.0
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
        const isThaiSite = window.location.hostname === 'bookwalker.in.th';
        
        if (isThaiSite) {
            // Always try to get the book UUID first
            const bookUUID = bookLink.href.match(/bookwalker\.[a-z\.]+\/(?:de|)(.+?)\//)[1];
            
            // Check for any existing button
            const existingBtn = bookBtnList.querySelector('.book-btn-item-full');
            if (existingBtn) {
                // If it's an "App only" button, replace it
                if (existingBtn.textContent.trim() === 'กรุณาอ่านอีบุ๊กนี้ด้วยแอป BOOK☆WALKER') {
                    existingBtn.innerHTML = `<a href="https://member.bookwalker.jp/app/03/webstore/cooperation?r=BROWSER_VIEWER/${bookUUID}/https%3A%2F%2Fbookwalker.jp%2FholdBooks%2F" target="_blank" class="btn btn-gray btn-read  btn-block book-status-viewer" data-action-label="อ่านหนังสือเล่มนี้"><i class="ico ico-book-open"></i><span class="txt"><span class="str">อ่านหนังสือเล่มนี้</span></span></a>`;
                }
            } else {
                // If no button exists, create a new one
                const newListItem = document.createElement('li');
                newListItem.className = 'book-btn-item book-btn-item-full';
                newListItem.innerHTML = `<a href="https://member.bookwalker.jp/app/03/webstore/cooperation?r=BROWSER_VIEWER/${bookUUID}/https%3A%2F%2Fbookwalker.jp%2FholdBooks%2F" target="_blank" class="btn btn-gray btn-read  btn-block book-status-viewer" data-action-label="อ่านหนังสือเล่มนี้"><i class="ico ico-book-open"></i><span class="txt"><span class="str">อ่านหนังสือเล่มนี้</span></span></a>`;
                bookBtnList.appendChild(newListItem);
            }
            return;
        }

        // Japanese site logic
        if (!bookBtnList.querySelector('.book-btn-item-full')) {
            const bookUUID = bookLink.href.match(/bookwalker\.[a-z\.]+\/(?:de|)(.+?)\//)[1];
            const newListItem = document.createElement('li');
            newListItem.className = 'book-btn-item book-btn-item-full';
            newListItem.innerHTML = `<a href="https://member.bookwalker.jp/app/03/webstore/cooperation?r=BROWSER_VIEWER/${bookUUID}/https%3A%2F%2Fbookwalker.jp%2FholdBooks%2F" target="_blank" class="btn btn-gray btn-read  btn-block book-status-viewer" data-action-label="この本を読む"><i class="ico ico-book-open"></i><span class="txt"><span class="str">この本を読む</span></span></a>`;
            bookBtnList.appendChild(newListItem);
        }
    }

    function waitForBookListUpdate() {
        return new Promise((resolve) => {
            const isThaiSite = window.location.hostname === 'bookwalker.in.th';
            
            const observer = new MutationObserver((mutations) => {
                if (isThaiSite) {
                    const bookList = document.querySelector('.md-book-list');
                    const seriesList = document.querySelector('.md-series-list');
                    const numberOfTotal = document.querySelector('.pagenate .numberOfTotal');
                    
                    if ((bookList || seriesList) && numberOfTotal && numberOfTotal.textContent !== '0') {
                        observer.disconnect();
                        resolve();
                    }
                } else {
                    const numberOfTotal = document.querySelector('.bookTl .numberOfTotal');
                    if (numberOfTotal && numberOfTotal.textContent !== '0') {
                        observer.disconnect();
                        resolve();
                    }
                }
            });
    
            const targetElement = isThaiSite ? 
                document.querySelector('.pagenate') : 
                document.querySelector('.bookTl');
    
            if (targetElement) {
                observer.observe(targetElement, { 
                    subtree: true, 
                    characterData: true,
                    childList: true 
                });
            } else {
                resolve();
            }
    
            setTimeout(() => {
                observer.disconnect();
                resolve();
            }, 10000);
        });
    }

    function initialize() {
        function checkExistingButtons() {
            const bookLists = document.querySelectorAll('.md-book-list .book-btn-list, .md-series-list .book-btn-list');
            bookLists.forEach(addReadButton);
        }

        function setupButtonObserver() {
            const observer = new MutationObserver((mutations) => {
                checkExistingButtons();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });

            checkExistingButtons();
        }

        if (window.location.hostname === 'bookwalker.in.th') {
            setupButtonObserver();
            
            waitForBookListUpdate().then(() => {
                const bookList = document.querySelector('.md-book-list');
                const seriesList = document.querySelector('.md-series-list');
                
                if (bookList) setupObserver(bookList);
                if (seriesList) setupObserver(seriesList);
            });
        } else {
            waitForBookListUpdate().then(() => {
                const bookLists = document.querySelectorAll('.md-book-list .book-btn-list');
                bookLists.forEach(addReadButton);
                setupObserver(document.querySelector('.md-book-list'));
            });
        }
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
