const target = document.body;
const observer = new MutationObserver(records =>
{
    //動画一覧の要素が更新されたときの処理
    //console.log("contents changed");
    //短時間に連続して更新が検知されるためタイマーを用いて吸収、最後の更新検知から一定時間後に後続処理を実施
    clearTimeout(observer._debounceTimer);
    observer._debounceTimer = setTimeout(() =>
    {
        //console.log("DOM changed, wait 500ms");
        const Items = document.querySelectorAll('#content.style-scope.ytd-rich-item-renderer'); //各動画の要素を取得
        //console.log(Items);
        Items.forEach(element =>
        {
            //トップページと登録チャンネルページのみ対象とする
            if (element.baseURI !== "https://www.youtube.com/" && element.baseURI !== "https://www.youtube.com/feed/subscriptions")
            {
                console.log("Not target URL");
                return;
            }
            if (element.innerText.includes("前 に配信済み")) //アーカイブ動画を抽出
            {
                if (element.style.backgroundColor !== "darkslateblue") //背景色が未設定の動画に対して背景色を設定
                {
                    console.log(element.innerText);
                    element.style.backgroundColor = "darkslateblue"; //背景色を設定
                }
            }
        });
        console.log("Complete");
    }, 500); // タイマーで吸収する時間の定義(ミリ秒)
});

observer.observe(target, {
    childList: true, // 子要素の追加・削除を監視
    subtree: true    // 子孫要素も監視
});

