$(async function () {
    await initSetting();
    initCategoryFilter();
});

async function initSetting() {
    createAreaFilter();
    initDateFilter();
    var dateParam = fetchDefaultDateParam();
    await fetchTopPageEvents(true, {
        'prefecture': '00',
        'calendarFrom': dateParam['from'],
        'calendarTo': dateParam['to'],
    });
    detailOpenEvent();
}

function detailOpenEvent() {
    $(document).on('click', '.jaja-display-click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $click = $(this);
        const $target = $click.nextAll('.jaja-display-target').first();
        if (!$target.length) return;

        // アイコン要素（最初の .las を想定）
        const $icon = $click.find('i.las').first();

        if ($target.hasClass('jaja-display-none')) {
            // 開く
            $target.removeClass('jaja-display-none');
            if ($icon.length) {
                $icon.removeClass('la-angle-right').addClass('la-angle-down');
            }
        } else {
            // 閉じる
            $target.addClass('jaja-display-none');
            if ($icon.length) {
                $icon.removeClass('la-angle-down').addClass('la-angle-right');
            }
        }
    });
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
async function fetchTopPageEvents(isInit, param) {
    try {
        const events = await fetchNewEvents(isInit, param);
        appendEvents(events);
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
    $('#events').empty();

    // 新しいイベントを取得して表示
    await fetchTopPageEvents(false, param);
}

/**
 * イベント一覧を設定する
 * @param {json} events 
 */
function appendEvents(events) {
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

        // 日付が変わった場合に見出しを挿入
        if (currentDate !== formattedDate) {
            // 前の日付セクションを閉じる（最初以外）
            if (currentDate !== null) {
                $("#events").append("</div></div>");
            }
            // 現在の日付のインデックスを取得
            const currentIndex = dateList.indexOf(formattedDate);

            // 前の日付と次の日付のリンクを作成
            const prevLink = currentIndex > 0 ?
                `<a href="javascript:void(0)" class="has-text-primary-50 is-size-65" onclick="smoothScroll('${"date-" + dateList[currentIndex - 1]}')">
                    <i class="las la-angle-left"></i>前の日
                </a>` : '';

            const nextLink = currentIndex < dateList.length - 1 ?
                `<a href="javascript:void(0)" class="has-text-primary-50 is-size-65" onclick="smoothScroll('${"date-" + dateList[currentIndex + 1]}')">
                    次の日<i class="las la-angle-right"></i>
                </a>` : '';
            const minWidth = "style='min-width: 80px;'";
            const youbiColor = youbi === '(土)' ? "has-text-info-50" : youbi === '(日)' ? "has-text-danger-50" : "";

            $("#events").append(`
                <div id="date-${formattedDate}" class="">
                    <div class="notification is-primary is-light p-0 my-3">
                        <div class="p-2">
                            <div class="level is-mobile mb-0">
                                <div class="level-left" ${minWidth}>
                                    ${prevLink}
                                </div>
                                <div class="level-item has-text-centered">
                                    <p class="is-size-65 mb-0 has-text-weight-semibold">
                                        <i class="lar la-calendar"></i> ${formattedDate} <span class="${youbiColor}">${youbi}</span>
                                    </p>
                                </div>
                                <div class="level-right" ${minWidth}>
                                    ${nextLink}
                                </div>
                            </div>
                        </div>
                    </div>

                <div class="date-events p-0">
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
        const newEventIcon = isNew ? `<i class="las la-leaf has-text-success"></i>` : "";
        const updateIcon = isUpdated ? `<i class="las la-angle-double-up has-text-info"></i>` : "";
        // イベント種類フィルタ用data-tag値
        const dataTag = createDataTag(event);

        // 都道府県ラベル
        const prefecture = `<span class="tag m-1 is-primary is-light shadow has-text-weight-bold">${event['prefecture']}</span>`;
        // カテゴリーラベル
        const category = `<span class="tag m-1 ${labelColor} shadow has-text-weight-bold">${event['category']}</span>`;
        // 大会ルールラベル
        const compCate = (event['composition'] != "" && isCompetition(event['category'])) ?
            `<span class="tag m-1 is-light shadow has-text-weight-bold">${event['composition']}</span>` : '';
        // 詳細ありラベル
        const detailLabel = createDetailLabel(event['article'], event['pickupSerial']);

        // イベント画像
        const imageArea = createImageDiv(event, i);

        // 曜日クラス
        const youbiColor = youbi === '(土)' ? "has-text-info-50" : youbi === '(日)' ? "has-text-danger-50" : "";
        // イベントタイトル
        const eventTitle = createTitle(event);
        // イベントシリーズ
        const seriesName = event['seriesName'] ? `<span class=""><i class="las la-scroll"></i> ${event['seriesName']}</span>／` : '';
        // 主催
        const org = event['org'] ? `<i class="las la-user"></i> ${event['org']}` : "";


        // 個人・チーム構成
        const composition = createComposition(
            event['composition'], event['maxMember'], event['minMember'], event['rule']);

        // 会場
        const gMapLink = event['place'] ?
            `<a class="has-text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['prefecture'] + ' ' + event['place'])}" target="_blank">${event['place']}</a>` : '';
        const placeLink = `<p class="is-size-7 my-1">${createDefaultTagClass("会場")}${gMapLink}</p>`;
        // ルール
        const rule = isCompetition(event['category']) ?
                `<p class="is-size-7 my-1">${createDefaultTagClass("ルール")}${composition} ${event['rule']}</p>` : '';
        // 定員
        const teamNum = isCompetition(event['category']) ?
            `<p class="is-size-7 my-1">${createDefaultTagClass("定員")}${event['teamNum']}</p>` : '';
        // エントリー開始
        const entryStart = isCompetition(event['category']) ?
            `<p class="is-size-7 my-1">${createDefaultTagClass("エントリー")}${event['entryStart']}</p>` : '';
        // 参加費
        const entryFee = `<p class="is-size-7 my-1">${createDefaultTagClass("参加費")}${event['entryFee']}</p>`;
        // 備考
        const remarks = createRemarksDiv(event, i);

        // 更新日時の日付フォーマット
        const updateDate = `${updateDateObj.getFullYear()}-${updateDateObj.getMonth() + 1}-${updateDateObj.getDate()}`;
        const updateDateMsg = isUpdated || isNew ? `<span class="has-text-success">更新日: ${updateDate}</span>` : `更新日: ${updateDate}`;

        // ソースボタン
        const source = `<a href="${event['source']}" target="_blank" class="card-footer-item is-size-65 p-2 has-text-weight-bold">
            <i class="las la-link"></i>ソース</a>`;
        // Googleカレンダー登録ボタン
        const gCalUrl = createGoogleCalendarLink(event['eventDate'], event['eventStart'],
            event['eventEnd'], event['eventName'], event['article'] ? event['article'] : event['source']);
        const gCalLink = `<a href="${gCalUrl}" target="_blank"
            class="card-footer-item is-size-65 p-2 has-text-weight-bold"><i class="las la-plus-circle"></i>カレンダー</a>`;
        // 記事リンクボタン
        const articleLink = createArticleLink(event['article']);

        $(`#date-${formattedDate} .date-events`).append(`
            <div class="card filter-item ${dataTag} mb-3" data-tag="${dataTag}">
                <div class="card-image">
                    <div class="tag-overlay jaja-tags">
                        ${prefecture}
                        ${category}
                        ${compCate}
                        ${detailLabel}
                    </div>
                    ${imageArea}
                </div>
                <div class="card-content px-3 py-1">
                    <div class="content">
                        <span class="subtitle is-size-65 is-middle"><i class="lar la-calendar"></i> ${formattedDate} <span class="${youbiColor}">${youbi}</span> ${eventTime}</span>
                        <p class="title is-5 mb-0 mt-1 has-text-link">${newEventIcon}${updateIcon}${eventTitle}</p>
                        <p class="subtitle is-size-7 has-text-grey mb-2 mt-0">${seriesName}${org}</p>
                        <div class="content">
                            <p class="is-fullwidth has-text-primary is-size-65 jaja-display-click mb-1 has-text-weight-semibold">
                                <span class="jaja-display-click-text">くわしくみる</span>
                                <i class="las la-angle-right is-size-6 ml-2 pt-1 has-text-primary"></i></p>
                            <div class="jaja-display-none jaja-display-target">
                                <div class="jaja-event-card-detail-list py-1 pl-1 jaja-event-detail-border">
                                    ${placeLink}
                                    ${rule}
                                    ${teamNum}
                                    ${entryStart}
                                    ${entryFee}
                                    ${remarks}
                                </div>
                                <p class="is-size-8 has-text-grey mt-1">${updateDateMsg}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <footer class="card-footer">
                    ${source}
                    ${gCalLink}
                    ${articleLink}
                </footer>
            </div>
        `);
    }
    // 最後の日付セクションを閉じる
    if (currentDate !== null) {
        $("#events").append("</div></div>");
    }
}

function createTitle(event) {
    if (event['article']) {
        // 詳細記事URLがある場合リンクとして返す
        return `
            <a class="text-" href="${event['article']}" target="_blank">${event['eventName']}</a>
        `;
    } else {
        return `
            <a class="text-" href="${event['source']}" target="_blank">${event['eventName']}</a>
        `;
    }
}

function createImageDiv(event, i) {
    if (event['image']) {
        if (event['article']) {
            return `
                <figure class="image is-fullwidth jaja-card-image">
                    <a class="" href="${event['article']}" target="_blank">
                        <img src="${event['image']}" alt="image of ${event['eventName']}" />
                    </a>
                </figure>
            `;
        } else {
            return `
                <figure class="image is-fullwidth jaja-card-image">
                    <a class="" href="${event['source']}" target="_blank">
                        <img src="${event['image']}" alt="image of ${event['eventName']}" />
                    </a>
                </figure>
            `;
        }
    } else {
        return `
            <figure class="image is-fullwidth jaja-card-image-default">
                <img src="https://bulma.io/assets/images/placeholders/1280x960.png"
                    alt="Placeholder image" />
            </figure>
        `;
    }
}

function createArticleLink(article) {
    if (article) {
        return `<a href="${article}" target="_blank" class="card-footer-item is-size-65 p-2 has-text-weight-bold"><i
                class="las la-link"></i>特集</a>`;
    } else {
        return '';
    }
}

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
            <div class="notification p-0 my-2 mx-1 is-size-7 has-background-white-ter">
                <p class="p-2">${entryRemarks + remarks}</p>
            </div>`;
    } else {
        return '';
    }
}

function createDetailLabel(article, pickupSerial) {
    if (article || pickupSerial) {
        return `
            <span class="tag m-1 is-warning shadow has-text-weight-bold">注目</span>
        `;
    } else {
        return '';
    }
}

function createGoogleMapLink(event) {
    return event['place'] ?
        `<a class="has-text-link"
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['prefecture'] + ' ' + event['place'])}"
            target="_blank"> ${event['place']}</a>` : '';
}



function createDefaultTagClass(name) {
    return `<span class="tag narrow mx-1 is-light p-1 has-text-weight-semibold">${name}</span>`;
}


