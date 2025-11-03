$(async function () {
    await initSettingSimplePage();
    initCategoryFilter();
});

async function initSettingSimplePage() {
    createAreaFilter();
    initDateFilter();
    var dateParam = fetchDefaultDateParam();
    var param = {
        'prefecture': '00',
        'calendarFrom': dateParam['from'],
        'calendarTo': dateParam['to'],
    };
    await fetchSimplePageEvents(true, param);
}

/**
 * カテゴリフィルターボタンの設定
 */
function initCategoryFilter() {
    initCommonCategoryFilter();
}

/**
 * 日付フィルタの設定
 */
function initDateFilter() {
    initCommonDateFilter();
}

/**
 * 都道府県フィルタの設定
 */
function createAreaFilter() {
    createCommonAreaFilter();
}

/**
 * イベント一覧を取得し設定する
 * @param {boolean} isInit 
 * @param {json} param 
 */
async function fetchSimplePageEvents(isInit, param) {
    try {
        const events = await fetchNewEvents(isInit, param);
        appendSimpleEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

/**
 * イベントの再取得・表示
 */
async function updateEvents() {
    // カテゴリフィルターを「すべて」に戻す
    $('.filter-category').addClass('is-light').removeClass('is-primary');
    $('.filter-category-0').addClass('is-primary').removeClass('is-light');

    const param = {
        'prefecture': $('.filter-area').val() || '00',
        'calendarFrom': $('.filter-calendar-from').val(),
        'calendarTo': $('.filter-calendar-to').val(),
    };

    // イベント一覧をクリア
    $('#simple-events').empty();

    // 新しいイベントを取得して表示
    await fetchSimplePageEvents(false, param);
}

function appendSimpleEvents(events) {
    let currentDate = null;
    let dateList = [];

    events.sort((a, b) => a['sortKey'] - b['sortKey']);
    // 最初に日付のリストを作成
    events.forEach(event => {
        const eventDate = new Date(event.eventDate);
        const date = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;
        if (!dateList.includes(date)) {
            dateList.push(date);
        }
    });

    for (i in events) {
        const event = events[i];
        const eventDate = new Date(event['eventDate']);
        const formattedDate = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;
        const week = ['日', '月', '火', '水', '木', '金', '土'];
        const youbi = '(' + week[eventDate.getDay()] + ')';

        // 日付が変わった場合にテーブルを変更
        if (currentDate !== formattedDate) {
            // 前の日付セクションを閉じる（最初以外）
            if (currentDate !== null) {
                $("#simple-events").append("</tbody></table>");
            }
            $("#simple-events").append(`
                <div id="date-${formattedDate}">
                    <section class="content mb-0 mt-6">
                        <h3 class="title is-size-5 mb-3 px-2">
                            <i class="lar la-calendar"></i> ${formattedDate} ${youbi}
                        </h3>
                    </section>
                    <table id="simple-table" class="table is-fullwidth is-narrow is-striped is-size-65">
                        <thead id="simple-head">
                            <tr class="is-selected has-text-light">
                                <th style="width:120px;">時間</th>
                                <th>イベント</th>
                            </tr>
                        </thead>
                            <tbody id="simple-body-${formattedDate}">
            `);
            lastDate = currentDate;
            currentDate = formattedDate;
        }

        // 開催日の日付フォーマット変更
        var eventTime = '';
        if (!(event['eventStart'] + event['eventEnd'])) { } else {
            eventTime = event['eventStart'] + ' - ' + event['eventEnd'];
        }

        // イベントラベルカラー
        const labelColor = {
            '大会': 'is-link', '大会（長期）': 'is-success',
            '体験会': 'is-light', '練習会': 'is-light',
            'ブース': 'is-light', 'その他': 'is-light'
        }[event['category']];
        // 新規・最近のイベントかの判定
        const now = new Date();
        const updateDateObj = new Date(event['updateDate']);
        const isNew = isNewCommonEvent(event, now);
        const isUpdated = isRecentCommonEvent(isNew, now, updateDateObj);
        const newEventIcon = isNew ? `<i class="las la-angle-double-up has-text-danger"></i>` : "";
        const updateIcon = isUpdated ? `<i class="las la-chevron-up has-text-primary"></i>` : "";

        // イベント種類フィルタ用data-tag値
        const dataTag = createDataTag(event);
        const eventTimeSpan = eventTime != "" ? `<span class="is-size-7">${eventTime}</span><br/>`
            : ""
        // 都道府県ラベル
        const prefecture = `<span class="tag mb-1 mr-1 px-1 is-primary is-light has-text-weight-bold is-size-7">
            <span class="has-text-primary-20">${event['prefecture']}</span></span><br/>`;
        // カテゴリーラベル
        const category = `<span class="tag mb-1 mr-1 px-1 is-size-7 has-text-weight-medium ${labelColor}">${event['category']}</span>`;
        // 個人・チーム構成
        const composition = createComposition(
            event['composition'], "", "", "");
        // 大会ルールラベル
        const compCate = (event['composition'] != "" && isCompetition(event['category'])) ?
            composition != "" ?
                `<span class="tag mr-1 px-1 is-size-8 has-text-weight-medium">${composition}</span>` :
                `<span class="tag mr-1 px-1 is-size-8 has-text-weight-medium">${event['composition']}</span>` :
            "";

        // イベントタイトル
        const eventTitle = createTitle(event);
        // 主催
        const org = event['org'] ?
            `</br><span class="is-size-7 has-text-grey">
                <i class="las la-user"></i> ${event['org']}
            </span>`
            : "";
        // イベントシリーズ
        const seriesName = event['seriesName'] ?
            `<br/><span class="is-size-7 has-text-grey">
                <i class="las la-scroll"></i> ${event['seriesName']}
            </span>`
            : '';
        // マップリンク
        const gMapLink = event['place'] ?
            `<br/><span class="is-size-7">
                <i class="las la-map-marker"></i><a class="has-text-link"
                    href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['prefecture'] + ' ' + event['place'])}"
                    target="_blank">${event['place']}</a></span>`
            : '';

        $(`#simple-body-${formattedDate}`).append(`
            <tr class="${dataTag} filter-item" data-tag="${dataTag}">
                <td class="is-middle">
                    ${eventTimeSpan}
                    ${prefecture}
                    ${category} ${compCate}
                </td>
                <td>
                    ${newEventIcon}${updateIcon}${eventTitle}
                    ${org}
                    ${seriesName}
                    ${gMapLink}
                </td>
            </tr>
        `);
    }
    // 最後の日付セクションを閉じる
    if (currentDate !== null) {
        $("#simple-events").append("</tbody></table></div>");
    }
}

function createTitle(event) {
    if (event['article']) {
        // 詳細記事URLがある場合リンクとして返す
        return `
            <a class="" href="${event['article']}" target="_blank">
                <span class="is-size-65">${event['eventName']}</span></a>
        `;
    } else {
        return `
            <a class="" href="${event['source']}" target="_blank">
                <span class="is-size-65 has-text-weight-medium">${event['eventName']}</span></a>
        `;
    }
}

