/**
 * ページ読み込み時実行
 */
$(function () {
    //処理を書く部分

    /**
     * init event
     */
    console.log('start getting recent events.')
    resetTechMessage();
    var dateParam = fetchInitDateParam();
    var param = {
        'prefecture': '00',
        'calendarFrom': dateParam['from'],
        'calendarTo': dateParam['to'],
    };
    fetchRecentEvents(param, true);
});

function resetTechMessage() {
    $("#tech-message").empty();
    $('#tech-message').append(
        `<p>情報取得中...</p>
        <progress class="progress" max="100"></progress>`
    );
}

/**
 * イベント情報HTMLを作成してHTMLに追加する。
 * @param {json} param パラメータ 
 * @param {boolean} isInit 初回動作か
 */
function fetchRecentEvents(param, isInit) {
    /**
     * イベント情報一覧読み込み・表示
     */
    const publicUrl = "https://storage.googleapis.com/molkky-calendar-json/recent.json";
    const maxItems = 100;

    $.ajax({
        url: publicUrl,
        type: 'GET',
        dataType: 'json',
    }).done(function (datas) {

        // 件数分イベントカードを生成して追加する
        for (const i in datas) {
            if (i >= maxItems) {
                break;
            }
            const event = datas[i];

            // イベント種類のラベルカラー
            const labelColor = {
                '大会': 'primary', '大会（長期）': 'success',
                '体験会': 'default', '練習会': 'default',
                'ブース': 'default', 'その他': 'default'
            }[event['category']];
            var category = event['category'];
            if (event['category'] == '大会（長期）') {
                var category = '長期大会'
            }

            // 開催日の日付フォーマット変更
            const eventDate = new Date(event['eventDate']).toLocaleDateString();
            var week = ['日', '月', '火', '水', '木', '金', '土'];
            const youbi = '(' + week[new Date(event['eventDate']).getDay()] + ')';
            var eventTime = event['eventTime'];

            // 更新日時の日付フォーマット変更
            const updateDate = new Date(event['updateDate']).toLocaleDateString();

            // イベント名称
            var link = event['article'] != "" ? event['article'] : event['source'];
            var eventName = event['eventName'].length > 30 ? event['eventName'].substring(0, 30) + '...' : event['eventName'];
            var eventTitle = `<a class="btn btn-link text-left" href="${link}" target="_blank">${eventName}</a>`;
            // カードCSSクラス
            var bgClass = createBgColor(event['article']);

            // イベントカード要素の追加
            $('#recent-body').append(
                `<tr class="${bgClass}">
                    <td style="font-size: .8rem;">
                        <span class="text-small">${eventDate}${youbi}</span><br/>
                        <span class="text-small">${eventTime}</span><br/>
                        <span class="label label-rounded text-small">${event['prefecture']}</span>
                        <span class="label label-rounded label-${labelColor} text-small">${category}</span><br/>
                    </td>
                    <td>
                        <span>${eventTitle}</span><br/>
                        <span class="label label-rounded text-small">主催</span> <span class="text-small">${event['org']}</span><br/>
                        <span class="label label-rounded text-small">会場</span> <span class="text-small">${event['place']}</span>
                    </td>
                    <td style="font-size: .6rem;"></td>
                </tr>`
            );
        }
        $('#tech-message > p').text(`情報取得完了: ${datas.length}件`);
        $('#tech-message > p').addClass('bg-success');
        $('#tech-message > progress').remove();

        // 一覧表示完了イベント
        return datas.length;
    });
}

/**
 * 
 * @returns 初期の日付パラメータ
 */
function fetchInitDateParam() {
    var date = new Date();
    var y = date.getFullYear();
    var m = ("00" + (date.getMonth() + 1)).slice(-2);
    var d = ("00" + date.getDate()).slice(-2);
    var calendarFrom = y + "-" + m + "-" + d;
    m = ("00" + (date.getMonth() + 2)).slice(-2);
    var calendarTo = y + "-" + m + "-" + d;
    return {
        'from': calendarFrom,
        'to': calendarTo
    };
}

/**
 * 
 * @param {json} event イベントJSON
 * @returns イベントタイトルを返す
 */
function createTitle(event) {
    if (event['article']) {
        // 詳細記事URLがある場合リンクとして返す
        return `
            <a class="text-primary" href="${event['article']}" target="_blank"> ${event['eventName']}</a>
        `;
    } else {
        return `${event['eventName']}`;
    }
}

/**
 * 
 * @param {json} event イベントJSON
 * @returns 詳細記事がある場合カードの背景CSSクラスを返す
 */
function createBgColor(article) {
    if (article) {
        return 'bg-secondary';
    } else {
        return '';
    }
}

/**
 * 
 * @param {json} event イベントJSON
 * @returns 記事リンクがある場合btn要素を返す
 */
function createArticleLink(article) {
    if (article) {
        return `<a class="btn btn-link text-left" href="${article}" target="_blank"><i class="icon icon-link"></i></a>`;
    } else {
        return '';
    }
}

/**
 * トップスクロール
 */
var vGoTop = {};
function goTop() {

    vGoTop["coef"] = 50;  // ←滑らか係数（大きいほど滑らか）
    vGoTop["cnt"] = 0;

    // --- 現在のスクロール位置取得 -----
    var startX = document.body.scrollLeft || document.documentElement.scrollLeft;
    var startY = document.body.scrollTop || document.documentElement.scrollTop;

    // --- スクロールの単位計算 ---------
    var moveSplitCnt = 0;
    for (var i = 1; i <= vGoTop["coef"]; i++) {
        moveSplitCnt += i * i;
    }
    vGoTop["unitH"] = startY / (moveSplitCnt * 2);

    vGoTop["nextX"] = startX;
    vGoTop["nextY"] = startY;

    // --- スクロール開始 ---------------
    goTopLoop();
}

/**
 * トップスクロース制御
 */
function goTopLoop() {
    // ============================================================================
    //  スクロール実行
    // ============================================================================

    vGoTop["cnt"]++;

    // --- 次のスクロール位置計算 -------
    var Coef = 0;
    if (vGoTop["cnt"] <= vGoTop["coef"]) {
        Coef = vGoTop["cnt"];
    } else {
        Coef = ((vGoTop["coef"] * 2) + 1) - vGoTop["cnt"];
    }
    vGoTop["nextY"] = vGoTop["nextY"] - Math.round(vGoTop["unitH"] * (Coef * Coef));
    if ((vGoTop["cnt"] >= (vGoTop["coef"] * 2)) || (vGoTop["nextY"] <= 0)) {
        vGoTop["nextY"] = 0;
    }

    // --- スクロール実行 ---------------
    window.scrollTo(vGoTop["nextX"], vGoTop["nextY"]);

    // --- 次のスクロールを設定 ---------
    if (vGoTop["nextY"] <= 0) {
        clearTimeout(vGoTop["timer"]);                   // 終了：タイマクリア
    } else {
        vGoTop["timer"] = setTimeout("goTopLoop()", 10);  // 次のループ
    }
}
