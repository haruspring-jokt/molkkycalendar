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
    $("#event-columns").empty();
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

function isEqualsPrefectureCodeAndName(code, name) {
    if (code == '00') {
        return ture;
    }
    if (code.slice(0, 1) == 'A') {
        var areaList = {
            'A1': ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島'],
            'A2': ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '山梨'],
            'A4': ['新潟', '富山', '石川', '福井', '長野'],
            'A3': ['岐阜', '静岡', '愛知', '三重'],
            'A5': ['滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'],
            'A6': ['鳥取', '島根', '岡山', '広島', '山口'],
            'A7': ['徳島', '香川', '愛媛', '高知'],
            'A8': ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'],
            'A0': ['海外']
        };
        return areaList[code].includes(name);
    }
    var prefectureList = {
        '01': '北海道', '02': '青森', '03': '岩手', '04': '宮城', '05': '秋田', '06': '山形',
        '07': '福島', '08': '茨城', '09': '栃木', '10': '群馬', '11': '埼玉', '12': '千葉',
        '13': '東京', '14': '神奈川', '15': '新潟', '16': '富山', '17': '石川', '18': '福井',
        '19': '山梨', '20': '長野', '21': '岐阜', '22': '静岡', '23': '愛知', '24': '三重',
        '25': '滋賀', '26': '京都', '27': '大阪', '28': '兵庫', '29': '奈良', '30': '和歌山',
        '31': '鳥取', '32': '島根', '33': '岡山', '34': '広島', '35': '山口', '36': '徳島',
        '37': '香川', '38': '愛媛', '39': '高知', '40': '福岡', '41': '佐賀', '42': '長崎',
        '43': '熊本', '44': '大分', '45': '宮崎', '46': '鹿児島', '47': '沖縄'
    };
    return prefectureList[code] == name;
}

/**
 * イベント情報HTMLを作成してHTMLに追加する。
 * @param {json} param パラメータ 
 * @param {boolean} isInit 初回動作か
 */
function fetchEvents(param, isInit) {

    console.log('fetchEvents: ', param);

    const publicUrl = "https://storage.googleapis.com/molkky-calendar-json/events.json";
    const maxItems = 300;

    $.ajax({
        url: publicUrl,
        type: 'GET',
        dataType: 'json',
    }).done(function (datas) {
        const filteredDatas = datas.filter((event) => {
            // ソートキーのチェック
            const isCorrectSk = isInit ? event.sk.slice(0, 1) == "0" : true;

            // JST変換・0:00:00化
            const dateObj = new Date(event.eventDate);
            dateObj.setHours(dateObj.getHours() + 9);
            const eventDateZero = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

            const fromDateObj = new Date(param['calendarFrom'] + "T00:00:00+09:00");
            const toDateObj = new Date(param['calendarTo'] + "T23:59:59+09:00");

            const isPrefectureMatch = param['prefecture'] === "00" || isEqualsPrefectureCodeAndName(param['prefecture'], event.prefecture);

            return isCorrectSk
                && eventDateZero >= fromDateObj
                && eventDateZero <= toDateObj
                && isPrefectureMatch;
        });

        // 件数分イベントカードを生成して追加する
        for (const i in filteredDatas) {
            if (i >= maxItems) {
                console.log('over' + maxItems + 'items. stop rendering.');
                break;
            }
            const event = filteredDatas[i];

            // イベント種類のラベルカラー
            const labelColor = {
                '大会': 'primary', '大会（長期）': 'success',
                '体験会': 'default', '練習会': 'default',
                'ブース': 'default', 'その他': 'default'
            }[event['category']];

            // 開催日の日付フォーマット変更
            const eventDate = new Date(event['eventDate']).toLocaleDateString();
            var week = ['日', '月', '火', '水', '木', '金', '土'];
            const youbi = '(' + week[new Date(event['eventDate']).getDay()] + ')';
            var eventTime = '';
            if (!(event['eventStart'] + event['eventEnd'])) { } else {
                eventTime = event['eventStart'] + ' - ' + event['eventEnd'];
            }

            // 更新日時の日付フォーマット変更
            const updateDate = new Date(event['updateDate']).toLocaleDateString();
            // 個人・チーム構成
            var composition = createComposition(
                event['composition'], event['maxMember'], event['minMember'], event['rule']);
            // 備考
            var remarks = createRemarksDiv(event, i);
            // 画像
            var imageArea = createImageDiv(event, i);
            // 記事
            var eventTitle = createTitle(event);
            // 詳細ありラベル
            var detailLabel = createDetailLabel(event['article']);
            // カードCSSクラス
            var cardClass = createCardClass(event['article']);
            // イベント種類フィルタ用data-tag値
            var dataTag = createDataTag(event);
            // 記事リンクボタン
            var articleLink = createArticleLink(event['article']);
            // カード幅
            var cardCol = filteredDatas.length === 1 ? 'col-6 col-lg-6 col-xl-6' : 'col-6 col-lg-6 col-xl-6';
            // シリーズ
            var seriesName = event['seriesName'] ? `<small class="text-tiny">${event['seriesName']}</small><br/>` : '';
            // ルール
            var rule = isCompetition(event['category']) ? `<li class="menu-item"> <small class="label text-bold">ルール</small> ${composition}</li>` : '';
            // 定員
            var teamNum = isCompetition(event['category']) ? `<li class="menu-item"> <small class="label text-bold">定員(チーム/人)</small> ${event['teamNum']}</li>` : '';
            // エントリー開始
            var entryStart = isCompetition(event['category']) ? `<li class="menu-item"> <small class="label text-bold">エントリー開始</small> ${event['entryStart']}</li>` : '';

            // イベントカード要素の追加
            $('#event-columns').append(
                `<div name="outer-card-upper-${i}" class="column ${cardCol} col-xs-12 p-2 filter-item ${dataTag}" data-tag="${dataTag}">
                    <div name="card-${i}" class="card ${cardClass}">
                        <div name ="card-header-${i}" class="card-header text-large">
                            ${seriesName}
                            <div name="card-title-${i}" class="card-title h3"><small class="label label-rounded text-bold">${event['prefecture']} </small> ${eventTitle}</div>
                            <div name="card-subtitle-${i} class="card-subtitle text-gray">
                                <span class="label label-rounded label-${labelColor}"> ${event['category']}</span>
                                ${detailLabel}
                                <i class="lar la-calendar"></i> ${eventDate} ${youbi} ${eventTime}
                            </div>
                            ${imageArea}
                        </div>
                        <div name="card-body-${i}" class="card-body">
                            <ul class="menu">
                                <li class="menu-item btn"><a class="btn btn-link text-left" href="${event['source']}" target="_blank"> <i class="icon icon-link"></i> ソース（情報取得元）</a></li>
                                ${articleLink}
                                <li class="menu-item"> <small class="label text-bold">主催</small> ${event['org']}</li>
                                <li class="menu-item"> <small class="label text-bold">場所</small> ${event['place']}</li>
                                ${rule}
                                ${teamNum}
                                ${entryStart}
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
        const counter = filteredDatas.length >= maxItems ? '多いため' + maxItems + '件まで表示' : filteredDatas.length + "件";
        $('#tech-message > p').text(`情報取得完了: ${counter}`);
        $('#tech-message > p').addClass('bg-success');
        $('#tech-message > progress').remove();

        if (isInit && filteredDatas.length > 0) {
            // 初回の場合開催日フィルタの日付を設定する
            var dateParam = fetchInitDateParam();
            $('#calendar-from').val(dateParam['from']);
            $('#calendar-to').val(dateParam['to']);
        }

        // 一覧表示完了イベント
        return filteredDatas.length;
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
function createComposition(composition, maxMember, minMember, rule) {
    if (composition == 'チーム') {
        if (maxMember) {
            return composition
                + '（' + minMember + '～' + maxMember + '）'
                + ' ' + rule;
        } else {
            return composition
                + '（' + minMember + '）'
                + ' ' + rule;
        }
    } else {
        return composition + ' ' + rule;
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
    if (!(event['remarks'])) { } else {
        remarks = `${event['remarks']}`;
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
 * 大会であるかの検証
 * @param {} category 
 * @returns 
 */
function isCompetition(category) {
    return ['大会', '大会（長期）'].includes(category);
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
                    <a class="" href="${event['source']}" target="_blank">
                    <img class="event-img" src="${event['image']}" alt="image of ${event['eventName']}"></a>
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
 * @returns 詳細記事がある場合カードの背景CSSクラスを返す
 */
function createCardClass(article) {
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
