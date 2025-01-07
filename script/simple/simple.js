/**
 * ページ読み込み時実行
 */
$(function () {
    /**
     * init event
     */
    console.log('start getting events.')
    resetTechMessage();
    var dateParam = fetchInitDateParam();
    var param = {
        'prefecture': '00',
        'calendarFrom': dateParam['from'],
        'calendarTo': dateParam['to'],
    };
    fetchEvents(param, true);

    /**
     * 都道府県選択イベント
     */
    $("#select-prefecture").change(function () {
        console.log("都道府県イベント: " + $(this).val());
        removeEvents();
        resetTechMessage();
        fetchEventsWithFilter();
    });

    /**
     * 開催日FROMフィルタイベント
     */
    $("#calendar-from").change(function () {
        console.log("日付FROMイベント: " + $(this).val());
        removeEvents();
        resetTechMessage();
        fetchEventsWithFilter();
    });

    /**
     * 開催日TOフィルタイベント
     */
    $("#calendar-to").change(function () {
        console.log("日付TOイベント: " + $(this).val());
        removeEvents();
        resetTechMessage();
        fetchEventsWithFilter();
    });

    // $("#filter-nav > label").on('click', function () {
    //     var activeTag = $('input[name=filter-radio]:checked').val();
    //     let count = 0;
    //     $(`.${activeTag}`).each(function () {
    //         count++;
    //     });
    //     $('#tech-message > p').text(`情報取得完了: ${count}件`);
    // })
});

function resetTechMessage() {
    $("#tech-message").empty();
    $('#tech-message').append(
        `<p>情報取得中...</p>
        <progress class="progress" max="100"></progress>`
    );
}

/**
 * イベント一覧削除
 */
function removeEvents() {
    $("#simple-body").empty();
}

/**
 * イベント情報一覧読み込み・表示（画面フィルター適用時）
 */
function fetchEventsWithFilter() {
    var param = {
        'prefecture': $("#select-prefecture").val(),
        'calendarFrom': $("#calendar-from").val(),
        'calendarTo': $("#calendar-to").val(),
    };
    fetchEvents(param, false);
}

/**
 * イベント情報HTMLを作成してHTMLに追加する。
 * @param {json} param パラメータ 
 * @param {boolean} isInit 初回動作か
 */
function fetchEvents(param, isInit) {
    /**
     * イベント情報一覧読み込み・表示
     */
    var url = 'https://script.google.com/macros/s/AKfycby6RrUbRI75MG4DAeXRRaIFo3xmwuGCg9S1hLQRBcvuPY_B20TNRWjXfb1nyBgXJ5JW/exec';
    if (param) {
        url = url + "?";
    }
    url = url + "api=" + "simple";
    if (!param['prefecture']) {
        url = url + "&prefecture=" + "00";
    } else {
        url = url + "&prefecture=" + param['prefecture'];
    }
    if (param['calendarFrom']) {
        url = url + "&calendarFrom=" + param['calendarFrom'];
    }
    if (param['calendarTo']) {
        url = url + "&calendarTo=" + param['calendarTo'];
    }
    console.log(url);

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
    }).done(function (datas) {
        var datasStringify = JSON.stringify(datas);
        var datasJson = JSON.parse(datasStringify);

        // 件数分イベントカードを生成して追加する
        for (const i in datasJson) {
            const event = datas[i];

            // イベント種類のラベルカラー
            const labelColor = {
                '大会': 'primary', '大会（長期）': 'success',
                '体験会': 'default', '練習会': 'default',
                'ブース': 'default', 'その他': 'default'
            }[event['category']];
            var category = event['category'];

            // 開催日の日付フォーマット変更
            const eventDate = new Date(event['eventDate']).toLocaleDateString();
            var week = ['日', '月', '火', '水', '木', '金', '土'];
            const youbi = '(' + week[new Date(event['eventDate']).getDay()] + ')';
            var dateBgClass = '';
            if (youbi == '(日)') {
                dateBgClass = 'bg-sunday';
            } else if (youbi == '(土)') {
                dateBgClass = 'bg-saturday';
            } else {
                dateBgClass = 'bg-gray';
            }
            var eventTime = '';
            if (!(event['eventStart'] + event['eventEnd'])) { } else {
                eventTime = event['eventStart'] + ' - ' + event['eventEnd'];
            }

            // 個人・チーム構成
            var composition = createComposition(
                event['composition'], event['maxMember'], event['minMember'], event['rule']);
            // 画像
            var imageArea = createImageDiv(event, i);
            // 記事
            var eventTitle = createTitle(event);
            // 詳細ありラベル
            var detailLabel = createDetailLabel(event['article']);
            // イベント種類フィルタ用data-tag値
            var dataTag = createDataTag(event);
            // 記事リンクボタン
            var articleLink = createArticleLink(event['article']);
            var url = '';
            if (articleLink === '') {
                url = event['source'];
            } else {
                url = articleLink;
            }

            // イベントカード要素の追加
            $('#simple-body').append(
                `<tr class="${dateBgClass} filter-item ${dataTag}" data-tag="${dataTag}">
                    <td>${eventDate}${youbi}</td>
                    <td>
                        <span class="label label-rounded">${event['prefecture']}</span> <span class="label label-rounded label-${labelColor}">${category}</span> ${eventTitle}<br/>
                        ${detailLabel} <span class="text-gray">${composition}</span>
                    </td>
                    <td align="right">${imageArea}</td>
                </tr>`
            );
        }
        $('#tech-message > p').text(`情報取得完了: ${datasJson.length}件`);
        $('#tech-message > p').addClass('bg-success');
        $('#tech-message > progress').remove();

        if (isInit && datasJson.length > 0) {
            // 初回の場合開催日フィルタの日付を設定する
            var dateParam = fetchInitDateParam();
            $('#calendar-from').val(dateParam['from']);
            $('#calendar-to').val(dateParam['to']);
        }

        // 一覧表示完了イベント
        return datasJson.length;
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
    if (m == "13") {
        y = date.getFullYear() + 1;
        m = "01";
    }
    var calendarTo = y + "-" + m + "-" + d;
    return {
        'from': calendarFrom,
        'to': calendarTo
    };
}

/**
 * 
 * @param {json} event イベントJSON 
 * @returns チーム構成Div要素
 */
function createComposition(composition, maxMember, minMember) {
    if (composition == 'チーム') {
        if (maxMember) {
            return composition
                + '（' + minMember + '～' + maxMember + '）';
        } else {
            return composition
                + '（' + minMember + '）';
        }
    } else {
        return composition + ' ';
    }
}

/**
 * 
 * @param {json} event イベントJSON
 * @param {int} i
 * @returns 画像URLが含まれている場合画像エリアDivを返す
 */
function createImageDiv(event, i) {
    if (event['image']) {
        return `
                <img class="event-simple-img" src="${event['image']}" alt="image of ${event['eventName']}">
            `;
    } else {
        return '';
    }
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
        return `
            <a class="text-primary" href="${event['source']}" target="_blank"> ${event['eventName']}</a>
        `;
    }
}

/**
 * 
 * @param {json} event イベントJSON
 * @returns 詳細記事がある場合追加のラベルを返す
 * 
 */
function createDetailLabel(article) {
    if (article) {
        return `
            <a class="text-primary" href="${article}" target="_blank">
                <span class="label label-rounded label-warning">注目</span>
            </a>
        `;
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
        return `<a class="btn btn-link text-left" href="${article}" target="_blank"> <i class="icon icon-link"></i> 記事をみる</a>`;
    } else {
        return '';
    }
}

/**
 * 
 * @param {json} event イベントJSON
 * @returns 種類フィルタ用のdeta-tagを返す
 */
function createDataTag(event) {
    if (!event['category']) {
        return 'tag-0';
    }
    if (!['大会', '大会（長期）', '体験会', '練習会', 'ブース', 'その他'].includes(event['category'])) {
        return 'tag-0';
    }
    var tag = {
        '大会': 'tag-1 tag-7', '大会（長期）': 'tag-2 tag-7',
        '体験会': 'tag-3 tag-8', '練習会': 'tag-4 tag-8',
        'ブース': 'tag-5', 'その他': 'tag-6'
    }[event['category']];
    if (event['article']) {
        tag = tag + ' tag-9';
    }
    return tag;
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
