/**
 * ページ読み込み時実行
 */
$(function () {
    //処理を書く部分
    $('#s-title').append('全国モルックイベント大会カレンダー');

    /**
     * init event
     */
    console.log('start getting events.')
    $('#tech-message').append(
        `<p>情報取得中...</p>
        <progress class="progress" max="100"></progress>`
    );
    var param = {
        'prefecture': '00',
        'calendarFrom': '',
        'calendarTo': '',
    };
    fetchEvents(param, true);

    /**
     * 都道府県選択イベント
     */
    $("#select-prefecture").change(function () {
        console.log("都道府県イベント: " + $(this).val());
        var param = {
            'prefecture': $(this).val(),
            'calendarFrom': $("#calendar-from").val(),
            'calendarTo': $("#calendar-to").val(),
        };
        removeEvents();
        $("#tech-message").empty();
        $('#tech-message').append(
            `<p>情報取得中...</p>
            <progress class="progress" max="100"></progress>`
        );
        fetchEvents(param, false);
    });

    /**
     * 開催日フィルタイベント
     */
    $("#calendar-from").change(function () {
        console.log("日付FROMイベント: " + $(this).val());
        var param = {
            'prefecture': $("#select-prefecture").val(),
            'calendarFrom': $("#calendar-from").val(),
            'calendarTo': $("#calendar-to").val(),
        };
        removeEvents();
        $("#tech-message").empty();
        $('#tech-message').append(
            `<p>情報取得中...</p>
            <progress class="progress" max="100"></progress>`
        );
        fetchEvents(param, false);
    });

    /**
     * 開催日フィルタイベント
     */
    $("#calendar-to").change(function () {
        console.log("日付TOイベント: " + $(this).val());
        var param = {
            'prefecture': $("#select-prefecture").val(),
            'calendarFrom': $("#calendar-from").val(),
            'calendarTo': $("#calendar-to").val(),
        };
        removeEvents();
        $("#tech-message").empty();
        $('#tech-message').append(
            `<p>情報取得中...</p>
            <progress class="progress" max="100"></progress>`
        );
        fetchEvents(param, false);
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

/**
 * イベント一覧削除
 */
function removeEvents() {
    $("#event-columns").empty();
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
    var url = 'https://script.google.com/macros/s/AKfycbwqTnusWS8wxR3p6fdPgdeCPux-Wafpgq9-Z2TE24fPqnSallmcMWeZcFZSAnbN5Z1J/exec';
    console.log(param);

    if (param) {
        url = url + "?";
    }

    if (!param['prefecture']) {
        url = url + "prefecture=" + "00";
    } else {
        url = url + "prefecture=" + param['prefecture'];
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

            // 開催日の日付フォーマット変更
            const eventDate = new Date(event['eventDate']).toLocaleDateString();
            var eventTime = '';
            if (!(event['eventStart'] + event['eventEnd'])) { } else {
                eventTime = event['eventStart'] + ' - ' + event['eventEnd'];
            }

            // 更新日時の日付フォーマット変更
            const updateDate = new Date(event['updateDate']).toLocaleDateString();
            // 個人・チーム構成
            var composition = createComposition(event);
            // 備考
            var remarks = createRemarksDiv(event, i);
            // 画像
            var imageArea = createImageDiv(event, i);
            // 記事
            var eventTitle = createTitle(event);
            // 詳細ありラベル
            var detailLabel = createDetailLabel(event);
            // カードCSSクラス
            var cardClass = createCardClass(event);
            // イベント種類フィルタ用data-tag値
            var dataTag = createDataTag(event);
            // 記事リンクボタン
            var articleLink = createArticleLink(event);
            // カード幅
            var cardCol = datasJson.length === 1 ? '' : 'col-6';

            // イベントカード要素の追加
            $('#event-columns').append(
                `<div name="outer-card-upper-${i}" class="column ${cardCol} col-xs-12 p-2 filter-item ${dataTag}" data-tag="${dataTag}">
                    <div name="card-${i}" class="card ${cardClass}">
                        <div name ="card-header-${i}" class="card-header text-large">
                            <div name="card-title-${i}" class="card-title h3">${eventTitle}</div>
                            <div name="card-subtitle-${i} class="card-subtitle text-gray">
                                <i class="lar la-calendar"></i> ${eventDate} ${eventTime}
                                <span class="label label-rounded label-${labelColor}"> ${event['category']}</span>
                                ${detailLabel}
                            </div>
                            ${imageArea}
                        </div>
                        <div name="card-body-${i}" class="card-body">
                            <ul class="menu">
                                <li class="menu-item btn"><a class="btn btn-link text-left" href="${event['source']}" target="_blank"> <i class="icon icon-link"></i> ソース（情報取得元）</a></li>
                                ${articleLink}
                                <li class="menu-item"> <small class="label text-bold">主催</small> ${event['org']}</li>
                                <li class="menu-item"> <small class="label text-bold">シリーズ</small> ${event['seriesName']}</li>
                                <li class="menu-item"> <small class="label text-bold">場所</small> <span class="label label-rounded">${event['prefecture']} </span> ${event['place']}</li>
                                <li class="menu-item"> <small class="label text-bold">ルール</small> ${composition}</li>
                                <li class="menu-item"> <small class="label text-bold">チーム/人</small> ${event['teamNum']}</li>
                                <li class="menu-item"> <small class="label text-bold">エントリー開始</small> ${event['entryStart']}</li>
                                <li class="menu-item"> <small class="label text-bold">参加費</small> ${event['entryFee']}</li>
                            </ul>
                        </div>
                        ${remarks}
                        <div name="card-footer-${i}" class="card-footer"></div>
                        <small class="text-gray text-small p-2">更新日: ${updateDate}</small>
                    </div>
                    <div name="outer-card-lower-${i}" class=""></div>
                </div>`
            );
        }
        $('#tech-message > p').text(`情報取得完了: ${datasJson.length}件`);
        $('#tech-message > p').addClass('bg-success');
        $('#tech-message > progress').remove();

        if (isInit && datasJson.length > 0) {
            // 初回の場合開催日フィルタの日付を設定する
            $('#calendar-from').val(datas[0]['eventDate'].slice(0, 10));
            $('#calendar-to').val(datas.slice(-1)[0]['eventDate'].slice(0, 10));
        }

        // 一覧表示完了イベント
        return datasJson.length;
    });
}

/**
 * 
 * @param {json} event イベントJSON 
 * @returns チーム構成Div要素
 */
function createComposition(event) {
    if (event['composition'] == 'チーム') {
        if (event['maxMember']) {
            return event['composition']
                + '（' + event['minMember'] + '～' + event['maxMember'] + '）'
                + ' ' + event['rule'];
        } else {
            return event['composition']
                + '（' + event['minMember'] + '）'
                + ' ' + event['rule'];
        }
    } else {
        return event['composition'] + ' ' + event['rule'];
    }
}

/**
 * 
 * @param {json} event イベントJSON
 * @param {int} i
 * @returns 備考Div要素
 */
function createRemarksDiv(event, i) {
    var isThereRemark = false;
    var entryRemarks = '';
    if (!event['entryRemarks']) { } else {
        entryRemarks = event['entryRemarks'] + '<br>';
        isThereRemark = true;
    }
    // 備考・メモ
    var remarks = '';
    if (!(event['remarks'] + event['memo'])) { } else {
        remarks = `${event['remarks']} ${event['memo']}`;
        isThereRemark = true;
    }
    if (isThereRemark) {
        return `
            <div name="card-remarks-${i}" class="card-body">
                <div class="toast text-small">
                    ${entryRemarks + remarks}
                </div>
            </div>`;
    } else {
        return '';
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
        if (event['article']) {
            return `
                <div name="card-image-${i}" class="card-image">
                    <a class="" href="${event['article']}" target="_blank">
                    <img class="event-img" src="${event['image']}" alt="image of ${event['eventName']}"></a>
                </div>
            `;
        } else {
            return `
                <div name="card-image-${i}" class="card-image">
                    <img class="event-img" src="${event['image']}" alt="image of ${event['eventName']}">
                </div>
            `;
        }
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
        return `${event['eventName']}`;
    }
}

/**
 * 
 * @param {json} event イベントJSON
 * @returns 詳細記事がある場合追加のラベルを返す
 * 
 */
function createDetailLabel(event) {
    if (event['article']) {
        return `
            <a class="text-primary" href="${event['article']}" target="_blank">
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
 * @returns 詳細記事がある場合カードの背景CSSクラスを返す
 */
function createCardClass(event) {
    if (event['article']) {
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
function createArticleLink(event) {
    if (event['article']) {
        return `<li class="menu-item btn"><a class="btn btn-link text-left" href="${event['article']}" target="_blank"> <i class="icon icon-link"></i> 記事をみる</a></li>`;
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
