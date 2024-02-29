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
    fetchEvents("00");

    /**
     * 都道府県選択イベント
     */
    $("#select-prefecture").change(function () {
        console.log("都道府県イベント: " + $(this).val());
        var str = $(this).val();
        removeEvents();
        $("#tech-message").empty();
        $('#tech-message').append(
            `<p>情報取得中...</p>
            <progress class="progress" max="100"></progress>`
        );
        fetchEvents(str);
    });
});

/**
 * イベント一覧削除
 */
function removeEvents() {
    $("#event-columns").empty();
}

/**
 * イベント情報HTMLを作成してHTMLに追加する。
 * @param {string} prefecture 都道府県コード 
 */
function fetchEvents(prefecture) {
    /**
     * イベント情報一覧読み込み・表示
     */
    var url = 'https://script.google.com/macros/s/AKfycbyGESZXIgPThsYLVGywYS7K0G_76hTaETBrThKLWNsyRAquwrqdIqZIt9sqHIFEn88M/exec';
    if (prefecture != "00") {
        url = url + "?prefecture=" + prefecture;
        console.log(url);
    }

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

            // イベントカード要素の追加
            $('#event-columns').append(
                `<div name="outer-card-upper-${i}" class="column col-6 col-xs-12 p-2">
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
        return event['composition']
            + '（' + event['minMember'] + '～' + event['maxMember'] + '）'
            + ' ' + event['rule'];
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
                <span class="label label-rounded label-secondary">くわしく見る</span>
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
