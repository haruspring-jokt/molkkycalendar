const TEXT_SIZE = "is-size-65";

$(function () {

    commonPageSetting();
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
});

function commonPageSetting() {

    appendHeader();
    appendFooter();
}

/**
 * ヘッダー追加
 */
function appendHeader() {
    // リンク設定をオブジェクトに統一
    const links = {
        top: "./",
        logo: "./asset/logo.png",
        recent: "./recent/",
        simple: "./simple/",
        points: "./points/",
        jajablog: JajaConstants.blog,
        twitter: JajaConstants.twitter,
        youtube: JajaConstants.youtube,
        suzuri: JajaConstants.suzuri,
        archive2024: JajaConstants.archive2024,
        archive2023: JajaConstants.archive2023,
        formFormat: JajaConstants.formFormat,
        formFree: JajaConstants.formFree,
        scoresheet: JajaConstants.scoresheet,
        molkkyprime: JajaConstants.molkkyprime,
    };

    // 階層調整処理
    const depth = location.pathname.split("/").length - 1;
    if (location.pathname !== "/") {
        const addPath = depth === 2 ? "." : depth === 3 ? "../." : "";
        Object.keys(links).forEach((key) => {
            if (!links[key].startsWith("http")) {
                links[key] = addPath + links[key];
            }
        });
    }

    // ヘッダーHTMLをテンプレートリテラルで定義
    const headerHtml = `
        <nav class="navbar is-fixed-top is-primary" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item" href="${links.top}">
                    <img src="${links.logo}" alt="jajapatatas logo" />
                </a>
                <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div id="navbarBasicExample" class="navbar-menu">
                <div class="navbar-start">
                    <a class="navbar-item has-text-light" href="${links.recent}">新規イベント</a>
                    <a class="navbar-item has-text-light" href="${links.simple}">シンプル版</a>
                    <a class="navbar-item has-text-light" href="${links.points}">ポイントランキング</a>
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link has-text-light">More</a>
                        <div class="navbar-dropdown">
                            <a class="navbar-item has-text-primary-50" href="${links.jajablog}" target="_blank">全国モルックカレンダーニュースブログ</a>
                            <a class="navbar-item has-text-primary-50" href="${links.archive2024}" target="_blank">過去のイベント 2024年版</a>
                            <a class="navbar-item has-text-primary-50" href="${links.archive2023}" target="_blank">過去のイベント 2023年版</a>
                            <a class="navbar-item has-text-primary-50" href="${links.formFormat}" target="_blank">掲載申請フォーム</a>
                            <a class="navbar-item has-text-primary-50" href="${links.formFree}" target="_blank">掲載申請フォーム（フリーフォーマット）</a>
                        </div>
                    </div>
                </div>
                <div class="navbar-end">
                    <div class="navbar-item">
                        <div class="buttons columns">
                            <a class="column button is-info" target="_blank" href="${links.twitter}">Twitter(X)</a>
                            <a class="column button is-danger" target="_blank" href="${links.youtube}">YouTube</a>
                            <a class="column button is-dark" target="_blank" href="${links.suzuri}">SUZURI</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // ヘッダーを追加
    $("#jaja-header").append(headerHtml);
}

/**
 * フッター追加
 */
function appendFooter() {
    // 基本リンク設定
    const links = {
        top: "./",
        logo: "./asset/logo.png",
        recent: "./recent/",
        simple: "./simple/",
        points: "./points/",
        jajablog: JajaConstants.blog,
        twitter: JajaConstants.twitter,
        youtube: JajaConstants.youtube,
        suzuri: JajaConstants.suzuri,
        archive2024: JajaConstants.archive2024,
        archive2023: JajaConstants.archive2023,
        formFormat: JajaConstants.formFormat,
        formFree: JajaConstants.formFree,
        scoresheet: JajaConstants.scoresheet,
        molkkyprime: JajaConstants.molkkyprime,
    };

    // 階層によるパス調整
    const depth = location.pathname.split("/").length - 1;
    if (location.pathname !== "/") {
        const addPath = depth === 2 ? "." : depth === 3 ? "../." : "";
        Object.keys(links).forEach((key) => {
            if (!links[key].startsWith("http")) {
                links[key] = addPath + links[key];
            }
        });
    }

    // フッターHTMLを一括生成
    const footerHtml = `
        <div class="columns has-background-primary" id="site-map">
            <ul class="content column has-text-light"><strong class="has-text-weight-bold has-text-light">全国モルックカレンダー</strong>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.top}">トップ</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.recent}">新規イベント</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.simple}">シンプル版</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.points}">独自ポイントランキング</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.archive2024}" target="_blank">過去のイベント 2024年版</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.archive2023}" target="_blank">過去のイベント 2023年版</a></li>
            </ul>
            <ul class="content column has-text-light"><strong class="has-text-weight-bold has-text-light">主催者向けイベント掲載申請</strong>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.formFormat}" target="_blank">掲載申請フォーム</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.formFree}" target="_blank">掲載申請フォーム（フリーフォーマット）</a></li>
            </ul>
            <ul class="content column has-text-light"><strong class="has-text-weight-bold has-text-light">リンク</strong>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.youtube}" target="_blank">YouTube</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.twitter}" target="_blank">Twitter(X)</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.suzuri}" target="_blank">SUZURI</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.jajablog}" target="_blank">全国モルックカレンダーニュースブログ</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.scoresheet}" target="_blank">モルック用スコアシートPDF</a></li>
                <li><a class="content ${TEXT_SIZE} has-text-primary-90" href="${links.molkkyprime}" target="_blank">モルック関東プライムリーグ</a></li>
            </ul>
        </div>
        <p class="content is-size-7 has-text-primary is-pulled-right">2024 全国モルックカレンダー Mölkky clan jaja patatas</p>
    `;

    // フッターに追加
    $("#jaja-footer").append(footerHtml);
}

async function fetchNewEvents(isInit, param) {
    const publicUrl = "https://storage.googleapis.com/molkky-calendar-json/events.json";
    const maxItems = 300;

    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        })
            .done(function (datas) {
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
                resolve(filteredDatas);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

/**
 * ポイントランキングページの順位表データを返す
 * @returns 順位表データ
 */
async function fetchStandings() {
    const publicUrl = "https://storage.googleapis.com/molkky-calendar-json/point_current_season.json";
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((event) => {
                return true;
            });
            resolve(filteredDatas);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

async function fetchPlayerDetail(playerId) {
    const publicUrl = "https://storage.googleapis.com/molkky-calendar-json/point_results.json";
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((record) => {
                return record['player_id'] === playerId;
            });
            resolve(filteredDatas);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

function createCommonAreaFilter() {
    areaOptions = JajaConstants.areaSelects;
    for (i in areaOptions) {
        opt = areaOptions[i];
        $(".filter-area").append($("<option>").val(opt["key"]).text(opt["text"]));
    }
    // エリア選択時のイベントハンドラを追加
    $('.filter-area').on('change', async function () {
        await updateEvents();
    });
}

/**
 * カテゴリフィルターボタンの設定
 */
function initCommonCategoryFilter() {
    // 初期状態ですべてのイベントを表示
    $('.filter-category-0').addClass('is-primary').removeClass('is-light');

    // カテゴリーフィルターボタンのクリックイベント
    $('.filter-category').click(function () {
        $('.filter-category').addClass('is-light').removeClass('is-primary');
        $(this).addClass('is-primary').removeClass('is-light');

        // カテゴリー番号に応じてイベントカードをフィルタリング
        const categoryNum = $(this).attr('class').match(/filter-category-(\d+)/)[1];
        if (categoryNum === '0') {
            // 「すべて」が選択された場合
            $('.filter-item').show();
            // すべての日付インデックスを表示
            $('[id^="date-"]').show();
        } else {
            // 特定のカテゴリーが選択された場合
            $('.filter-item').hide();
            $(`.filter-item[data-tag*="event-tag-${categoryNum}"]`).show();
            // 各日付インデックスについて、表示すべきイベントがあるかチェック
            $('[id^="date-"]').each(function () {
                const dateId = $(this).attr('id');
                // この日付インデックス内の表示されているイベント数をカウント
                const visibleEvents = $(this).find(`.filter-item[data-tag*="event-tag-${categoryNum}"]`).length;
                // イベントの有無に応じて日付インデックスの表示/非表示を切り替え
                $(this).toggle(visibleEvents > 0);
            });
        }
    });
}

function initCommonDateFilter() {
    var dateParam = fetchDefaultDateParam();
    $('.filter-calendar-from').val(dateParam['from']);
    $('.filter-calendar-to').val(dateParam['to']);

    // fromの日付が変更された時のイベントハンドラ
    $('.filter-calendar-from').on('change', async function () {
        const fromDate = new Date($(this).val());
        // fromの1ヶ月後の日付を計算
        const toDate = new Date(fromDate);
        toDate.setMonth(toDate.getMonth() + 1);
        // toの日付を更新
        const toDateString = toDate.toISOString().split('T')[0];
        $('.filter-calendar-to').val(toDateString);
        // イベントを再取得
        await updateEvents();
    });

    // toの日付が変更された時のイベントハンドラ
    $('.filter-calendar-to').on('change', async function () {
        await updateEvents();
    });
}

function isNewCommonEvent(event, now) {
    const registerDateObj = new Date(event['registerDate']);
    return (now - registerDateObj) / (1000 * 60 * 60 * 24) <= 7;
}

function isRecentCommonEvent(isNewEvent, now, updateDateObj) {
    return !isNewEvent && (now - updateDateObj) / (1000 * 60 * 60 * 24) <= 7;
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

function fetchDefaultDateParam() {
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

function createDataTag(event) {
    if (!event['category']) {
        return 'event-tag-99';
    }
    if (!['大会', '大会（長期）', '体験会', '練習会', 'ブース', 'その他'].includes(event['category'])) {
        return 'event-tag-99';
    }
    var tag = 'event-tag-0 ' + {
        '大会': 'event-tag-1 event-tag-7', '大会（長期）': 'event-tag-2 event-tag-7',
        '体験会': 'event-tag-3', '練習会': 'event-tag-3',
        'ブース': 'event-tag-5', 'その他': 'event-tag-6'
    }[event['category']];
    if (event['article']) {
        tag = tag + ' event-tag-9';
    }
    return tag;
}

function isCompetition(category) {
    return ['大会', '大会（長期）'].includes(category);
}

function createComposition(composition, maxMember, minMember, rule) {
    if (composition == 'チーム') {
        if (maxMember == "" && minMember == "") {
            return composition + ' ' + rule;
        }
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
 * トップスクロール
 */
var vGoTop = {};
function goTop() {

    vGoTop["coef"] = 10;  // ←滑らか係数（大きいほど滑らか）
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
