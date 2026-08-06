$(async function () {
    await initSettingRecentPage();
    
    appendRecentPageCommonParts();
});

async function initSettingRecentPage() {
    createAreaFilter();
    var param = {};
    await fetchRecentPageEvents(true, param);
    initCategoryFilter();
}

/**
 * カテゴリフィルターボタンの設定
 */
function initCategoryFilter() {
    initCommonCategoryFilter();
}

function appendRecentPageCommonParts() {
    appendCommonEventInfoForm();
    appendCommonSiteLinks();
    appendCommonGoogleAds();
}

/**
 * 都道府県フィルタの設定
 */
function createAreaFilter() {
    createCommonAreaFilter();
}

async function fetchRecentPageEvents(isInit, param) {
    try {
        const events = await fetchRecentEvents(isInit, param);
        appendRecentEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function appendRecentEvents(events) {
    var isMostRecent = false;
    var firstUpdateDate = new Date(events[0]['updateDate']);
    firstUpdateDate = `${firstUpdateDate.getFullYear()}-${firstUpdateDate.getMonth() + 1}-${firstUpdateDate.getDate()}`;

    for (i in events) {
        const event = events[i];
        event.serial = event['serial'] ?? event['id'] ?? event['event_id'] ?? event['eventId'] ?? '';
        const eventDate = new Date(event['eventDate']);
        const formattedDate = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;
        const week = ['日', '月', '火', '水', '木', '金', '土'];
        const youbi = '(' + week[eventDate.getDay()] + ')';

        // updateDateとevent['updateDate']が同じ日付の場合、isMostRecentにtrueを設定する
        const currentUpdateDate = new Date(event['updateDate']);
        const currentDateStr = `${currentUpdateDate.getFullYear()}-${currentUpdateDate.getMonth() + 1}-${currentUpdateDate.getDate()}`;
        isMostRecent = currentDateStr === firstUpdateDate;

        // イベント種類フィルタ用data-tag値
        const dataTag = createDataTag(event);
        // 開催日の日付フォーマット変更
        var eventTime = '';
        if (!(event['eventStart'] + event['eventEnd'])) { } else {
            eventTime = event['eventStart'] + ' - ' + event['eventEnd'];
        }
        const eventTimeSpan = event['eventTime'] != "" && event['eventTime'] != "-"
            ? `<br/><span class="is-size-7">${event['eventTime']}</span>`
            : ""
        // 都道府県ラベル
        const prefecture = `<br/><span class="tag my-2 mr-1 px-1 is-primary is-light has-text-weight-bold is-size-7">
            <span class="has-text-primary-20">${event['prefecture']}</span></span>`;
        // イベントラベルカラー
        const labelColor = {
            '大会': 'is-link', '大会（長期）': 'is-success',
            '体験会': 'is-light', '練習会': 'is-light',
            'ブース': 'is-light', 'その他': 'is-light'
        }[event['category']];
        // カテゴリーラベル
        const category = `<span class="tag mr-1 px-1 is-size-7 has-text-weight-medium ${labelColor}">${event['category']}</span>`;
        // イベントタイトル
        const eventTitle = createTitle(event);
        // 主催
        const org = event['org'] ?
            `</br><span class="is-size-7 has-text-grey">
                <i class="las la-user mr-1"></i>${event['org']}
            </span>`
            : "";
        // マップリンク
        const gMapLink = event['place'] ?
            `<br/><span class="is-size-7">
                <i class="las la-map-marker mr-1"></i><a class="has-text-link"
                    href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['prefecture'] + ' ' + event['place'])}"
                    target="_blank">${event['place']}</a></span>`
            : '';
        // 最新アイコン
        const mostRecent = isMostRecent ?
            `<i class="las la-leaf has-text-success mr-1"></i>` : "";

        $("#recent-events").append(`
            <tr class="${dataTag} filter-item" data-tag="${dataTag}">
                <td class="is-middle py-3 my-3">
                    <span class="is-size-7">${formattedDate} ${youbi}</span>
                    ${eventTimeSpan}
                    ${prefecture}
                    ${category}
                </td>
                <td class="is-middle py-3 my-3">
                    ${mostRecent}${eventTitle}
                    ${org}
                    ${gMapLink}
                </td>
            </tr>
        `);
    }
}

function createTitle(event) {
    const detailHref = getEventDetailHref(event);
    return `
        <a class="has-text-link" href="${detailHref}">
            <span class="is-size-65 has-text-weight-medium">${event['eventName']}</span></a>
    `;
}
