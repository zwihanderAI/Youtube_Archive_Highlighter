(() => {
    'use strict';

    const HIGHLIGHT_CLASS = 'yt-live-archive-highlight';
    const STYLE_ID = 'yt-live-archive-style';
    const DEBOUNCE_MS = 300;

    const ITEM_SELECTOR = 'ytd-rich-item-renderer';
    const GRID_SELECTOR = 'ytd-rich-grid-renderer';
    const CONTENT_SELECTOR = '#content';

    const LIVE_ARCHIVE_RE = /前\s*に配信済み/;

    let debounceTimer = null;
    let observer = null;
    let observedGrid = null;

    /* ---------- ページ判定 ---------- */

    function isTargetPage() {
        return location.pathname === '/' ||
               location.pathname === '/feed/subscriptions';
    }

    /* ---------- 個別item処理 ---------- */

    function processItem(item) {
        const content = item.querySelector(CONTENT_SELECTOR);
        if (!content) return;

        const isArchive = LIVE_ARCHIVE_RE.test(content.textContent ?? '');
        content.classList.toggle(HIGHLIGHT_CLASS, isArchive);
    }

    /* ---------- 全体処理 ---------- */

    function updateItems() {
        if (!isTargetPage()) return;

        document.querySelectorAll(ITEM_SELECTOR).forEach(processItem);
    }

    /* ---------- デバウンス ---------- */

    function scheduleUpdate() {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            updateItems();
        }, DEBOUNCE_MS);
    }

    /* ---------- CSS ---------- */

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .${HIGHLIGHT_CLASS} {
                background-color: darkslateblue !important;
            }
        `;

        document.head.appendChild(style);
    }

    /* ---------- MutationObserver ---------- */

    function observeMainGrid() {
        const grid = document.querySelector(GRID_SELECTOR);

        // まだGridが生成されていない場合
        if (!grid) return;

        // 同じGridを既に監視している場合
        if (grid === observedGrid) return;

        // YouTube側でGridが再生成された場合に古いObserverを破棄
        observer?.disconnect();

        observedGrid = grid;

        observer = new MutationObserver(scheduleUpdate);
        observer.observe(grid, {
            childList: true,
            subtree: true
        });

        scheduleUpdate();
    }

    /* ---------- ページ変更時処理 ---------- */

    function handlePageChange() {
        clearTimeout(debounceTimer);

        // SPA遷移後はGrid自体が置き換わる可能性がある
        observer?.disconnect();
        observer = null;
        observedGrid = null;

        if (!isTargetPage()) return;

        /*
         * yt-navigate-finish時点でもGrid生成が完了していない場合があるため、
         * MutationObserverでdocumentを恒常監視するのではなく、
         * 次のイベントループで一度確認する。
         */
        setTimeout(() => {
            observeMainGrid();
            scheduleUpdate();
        }, 0);
    }

    /* ---------- エントリポイント ---------- */

    addStyle();

    // YouTubeのSPAページ遷移に対応
    document.addEventListener('yt-navigate-finish', handlePageChange);

    handlePageChange();
})();