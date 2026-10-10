(() => {
    'use strict';

    const HIGHLIGHT_CLASS = 'yt-live-archive-highlight';
    const DEBOUNCE_MS = 300;

    const LIVE_ARCHIVE_RE = /前\s*に配信済み/;

    let debounceTimer = null;
    const processedSet = new WeakSet();

    /* ---------- 判定 ---------- */

    function isTargetPage() {
        return location.pathname === '/' ||
               location.pathname === '/feed/subscriptions';
    }

    /* ---------- 個別item処理 ---------- */

    function processItem(item) {
        if (processedSet.has(item)) return;
        processedSet.add(item);

        const content = item.querySelector('#content');
        if (!content) return;

        const isArchive = LIVE_ARCHIVE_RE.test(content.textContent);
        content.classList.toggle(HIGHLIGHT_CLASS, isArchive);
    }

    /* ---------- 全体処理 ---------- */

    function updateItems() {
        if (!isTargetPage()) return;

        const items = document.querySelectorAll('ytd-rich-item-renderer');
        for (const item of items) {
            processItem(item);
        }
    }

    /* ---------- デバウンス ---------- */

    function scheduleUpdate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateItems, DEBOUNCE_MS);
    }

    /* ---------- CSS ---------- */

    function addStyle() {
        if (document.getElementById('yt-live-archive-style')) return;

        const style = document.createElement('style');
        style.id = 'yt-live-archive-style';
        style.textContent = `
            .${HIGHLIGHT_CLASS} {
                background-color: darkslateblue !important;
            }
        `;
        document.head.appendChild(style);
    }

    /* ---------- MutationObserver（無限スクロール対応） ---------- */

    function observeMainGrid() {
        const grid = document.querySelector('ytd-rich-grid-renderer');
        if (!grid) return;

        const observer = new MutationObserver(scheduleUpdate);
        observer.observe(grid, { childList: true, subtree: true });
    }

    /* ---------- エントリポイント ---------- */

    addStyle();
    observeMainGrid();
    scheduleUpdate();
})();