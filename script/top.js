$(async function () {
    await initSetting();
    initCategoryFilter();
});

async function initSetting() {
    createAreaFilter();
    initDateFilter();
    var dateParam = fetchDefaultDateParam();
    var param = {
        'prefecture': '00',
        'calendarFrom': dateParam['from'],
        'calendarTo': dateParam['to'],
    };
    await fetchTopPageEvents(true, param);
}

/**
 * カテゴリフィルターボタンの設定
 */
function initCategoryFilter() {
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
        } else {
            // 特定のカテゴリーが選択された場合
            $('.filter-item').hide();
            $(`.filter-item[data-tag*="event-tag-${categoryNum}"]`).show();
        }
    });
}

function initDateFilter() {
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

async function fetchTopPageEvents(isInit, param) {
    try {
        const events = await fetchNewEvents(isInit, param);
        appendEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function createAreaFilter() {
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


// イベントの再取得と表示を行う関数
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

function appendEvents(events) {
    let currentDate = null;
    let dateList = [];

    // 最初に日付のリストを作成
    events.forEach(event => {
        const date = new Date(event.eventDate).toLocaleDateString();
        if (!dateList.includes(date)) {
            dateList.push(date);
        }
    });

    for (i in events) {
        const event = events[i];
        const eventDate = new Date(event['eventDate']);
        const formattedDate = eventDate.toLocaleDateString();
        const week = ['日', '月', '火', '水', '木', '金', '土'];
        const youbi = '(' + week[eventDate.getDay()] + ')';

        // 日付が変わった場合に見出しを挿入
        if (currentDate !== formattedDate) {
            // 現在の日付のインデックスを取得
            const currentIndex = dateList.indexOf(formattedDate);
            
            // 前の日付と次の日付のリンクを作成
            const prevLink = currentIndex > 0 ? 
                `<a href="javascript:void(0)" class="has-text-primary" onclick="smoothScroll('${dateList[currentIndex - 1]}')">
                    <i class="las la-angle-left"></i>前の日
                </a>` : '';
            
            const nextLink = currentIndex < dateList.length - 1 ? 
                `<a href="javascript:void(0)" class="has-text-primary" onclick="smoothScroll('${dateList[currentIndex + 1]}')">
                    次の日<i class="las la-angle-right"></i>
                </a>` : '';

            $("#events").append(`
                <div class="notification is-primary is-light p-0 my-3" id="${formattedDate}">
                    <div class="p-2">
                        <div class="level is-mobile mb-0">
                            <div class="level-left">
                                ${prevLink}
                            </div>
                            <div class="level-item">
                                <p class="is-size-6 mb-0">
                                    <i class="lar la-calendar"></i> ${formattedDate} ${youbi}
                                </p>
                            </div>
                            <div class="level-right">
                                ${nextLink}
                            </div>
                        </div>
                    </div>
                </div>
            `);
            lastDate = currentDate;
            currentDate = formattedDate;
        }

        // 開催日の日付フォーマット変更
        var eventTime = '';
        if (!(event['eventStart'] + event['eventEnd'])) { } else {
            eventTime = event['eventStart'] + ' - ' + event['eventEnd'];
        }

        // イベントカラー
        const labelColor = {
            '大会': 'is-link', '大会（長期）': 'is-success',
            '体験会': 'is-light', '練習会': 'is-light',
            'ブース': 'is-light', 'その他': 'is-light'
        }[event['category']];
        // イベント種類フィルタ用data-tag値
        var dataTag = createDataTag(event);
        // 詳細ありラベル
        var detailLabel = createDetailLabel(event['article']);
        // 画像 
        var imageArea = createImageDiv(event, i);
        // シリーズ
        var seriesName = event['seriesName'] ? `<small class="text-tiny">${event['seriesName']}</small>／` : '';
        // 記事
        var eventTitle = createTitle(event);
        // 記事リンクボタン
        var articleLink = createArticleLink(event['article']);
        // Googleカレンダー登録リンクを作成する
        const gCalLink = createGoogleCalendarLink(event);
        // googleマップ検索リンク
        var placeLink = event['place'] ? `<a class="" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['prefecture'] + ' ' + event['place'])}" target="_blank">${event['place']}</a>` : '';
        // 個人・チーム構成
        var composition = createComposition(
            event['composition'], event['maxMember'], event['minMember'], event['rule']);
        var compCate = event['composition'] != "" && isCompetition(event['category']) ? `<span class="tag m-1 is-light">${event['composition']}</span>` : '';
        // ルール
        var rule = isCompetition(event['category']) ?
            `<p class="is-size-7 m-1"><span class="tag mx-1 is-light">ルール</span>${composition}</p>` : '';
        // 定員
        var teamNum = isCompetition(event['category']) ?
            `<p class="is-size-7 m-1"><span class="tag mx-1 is-light">定員 (人/チーム)</span>${event['teamNum']}</p>` : '';
        // エントリー開始
        var entryStart = isCompetition(event['category']) ?
            `<p class="is-size-7 m-1"><span class="tag mx-1 is-light">エントリー開始</span>${event['entryStart']}</p>` : '';
        // 備考
        var remarks = createRemarksDiv(event, i);
        // 更新日時の日付フォーマット変更
        const updateDate = new Date(event['updateDate']).toLocaleDateString();

        $("#events").append(`
            <div class="card filter-item ${dataTag}" data-tag="${dataTag}">
                <div class="card-image">
                    <div class="tag-overlay jaja-tags">
                        <span class="tag m-1 is-primary is-light">${event['prefecture']}</span>
                        <span class="tag m-1 ${labelColor}">${event['category']}</span>
                        ${compCate}
                        ${detailLabel}
                    </div>
                    ${imageArea}
                </div>
                <div class="card-content p-3">
                    <div class="content">
                        <span class="subtitle is-size-6 is-middle"><i class="lar la-calendar"></i> ${formattedDate} ${youbi} ${eventTime}</span>
                        <p class="title is-5 my-2">${eventTitle}</p>
                        <p class="subtitle is-size-7 has-text-grey">${seriesName}${event['org']}</p>
                        <p>
                            <a class="" href="${event['source']}" target="_blank"><button
                                    class="button m-1 is-link is-outlined is-small"><i
                                        class="las la-link"></i>ソース</button></a>
                            ${articleLink}
                            ${gCalLink}
                        </p>
                        <div class="jaja-event-card-detail">
                            <p class="is-size-7 m-1"><span class="tag mx-1 is-light">会場</span>${placeLink}</p>
                            ${rule}
                            ${teamNum}
                            ${entryStart}
                            <p class="is-size-7 m-1"><span class="tag mx-1 is-light">参加費</span>${event['entryFee']}</p>
                            ${remarks}
                        </div>
                        <p class="is-size-7 has-text-grey">更新日: ${updateDate}</p>
                    </div>
                </div>
            </div>
        `);
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
        return `<a class="" href="${article}"
                                target="_blank"><button class="button m-1 is-primary is-outlined is-small"><i
                                        class="las la-link"></i>特集記事</button></a>`;
    } else {
        return '';
    }
}

function createGoogleCalendarLink(event) {
    // YYYY/M/D形式の文字列を0埋めしてYYYYMMDDに変換する
    const calEventDate = event['eventDate'];
    const calendarDate = ("0000" + new Date(calEventDate).getFullYear()).slice(-4)
        + ("00" + (new Date(calEventDate).getMonth() + 1)).slice(-2)
        + ("00" + new Date(calEventDate).getDate()).slice(-2);
    const gCalUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const gCalDetails = '情報取得元: ' + (event['article'] ? event['article'] : event['source']) + '\n全国モルックカレンダーにより追加されたイベントです。 詳細は主催者にお問い合わせください。';
    // イベント開始・終了時刻がともにある場合
    var gCalLink = event['eventStart'] && event['eventEnd'] ?
        gCalUrl
        + '&text=' + encodeURIComponent(event['eventName'])
        + '&dates=' + calendarDate + 'T' + event['eventStart'].replace(/:/g, '') + '00/' + calendarDate + 'T' + event['eventEnd'].replace(/:/g, '') + '00'
        + '&details=' + encodeURIComponent(gCalDetails)
        // イベント開始時刻のみある場合、0分のイベントとして登録する
        : event['eventStart'] ?
            gCalUrl
            + '&text=' + encodeURIComponent(event['eventName'])
            + '&dates=' + calendarDate + 'T' + event['eventStart'].replace(/:/g, '') + '00/' + calendarDate + 'T' + event['eventStart'].replace(/:/g, '') + '00'
            + '&details=' + encodeURIComponent(gCalDetails)
            // 開始時刻がない場合は、終日として登録する
            : gCalUrl
            + '&text=' + encodeURIComponent(event['eventName'])
            + '&dates=' + calendarDate + '/' + calendarDate
            + '&details=' + encodeURIComponent(gCalDetails);
    return `<a class=""
                href="${gCalLink}"
                target="_blank"><button class="button m-1 is-info is-outlined is-small"><i
                        class="las la-plus-circle"></i>Gカレンダー</button></a>`;
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
            <div class="notification p-0 m-2 is-size-7 has-background-white-ter">
                <p class="p-2">${entryRemarks + remarks}</p>
            </div>`;
    } else {
        return '';
    }
}

function createDetailLabel(article) {
    if (article) {
        return `
            <span class="tag m-1 is-warning">注目</span>
        `;
    } else {
        return '';
    }
}

// smoothScroll関数をグローバルスコープで定義
window.smoothScroll = function(targetId) {
    const SCROLL_OFFSET = 80;
    const element = document.getElementById(targetId);
    if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
        window.scrollTo({
            top: targetPosition,
            behavior: 'instant'
        });
    }
};
