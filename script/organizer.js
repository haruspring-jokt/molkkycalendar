$(async function () {
    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('orgId');
    await initOrganizerPage(orgId);
});

async function initOrganizerPage(orgId) {
    try {
        // `commonPageSetting()` は `script.js` の初期化で既に実行されるため重複呼び出ししない

        if (!orgId) {
            appendOrganizerNotFound('orgId が指定されていません。');
            return;
        }

        const organizer = await fetchOrganizerById(orgId);
        if (!organizer) {
            appendOrganizerNotFound(`主催者ID「${orgId}」の情報が見つかりませんでした。`);
            return;
        }

        const events = await fetchEventsByOrgId(orgId);
        const sortedEvents = events.slice();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = sortedEvents
            .filter((event) => {
                const eventDate = new Date(event['eventDate']);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today;
            })
            .sort((a, b) => new Date(a['eventDate']) - new Date(b['eventDate']));

        const past = sortedEvents
            .filter((event) => {
                const eventDate = new Date(event['eventDate']);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate < today;
            })
            .sort((a, b) => new Date(b['eventDate']) - new Date(a['eventDate']));

        appendOrganizerHeader(organizer, upcoming.length, past.length);
        appendOrganizerEventSections(upcoming, past);
    } catch (error) {
        console.error(error);
        appendOrganizerNotFound('主催者データの取得中にエラーが発生しました。');
    }
}

function appendOrganizerNotFound(message) {
    $('#organizer-page-content').append(`
        <div class="notification is-danger is-light">
            <p class="title is-size-5">主催者ページが見つかりませんでした</p>
            <p class="is-size-65">${escapeHtml(message)}</p>
        </div>
    `);
}

function appendOrganizerHeader(organizer, upcomingCount, pastCount) {
    const homepageLink = organizer.hp ? `<a href="${organizer.hp}" target="_blank" class="has-text-link is-flex is-align-items-center"><i class="las la-home mr-2"></i>主催者のホームページ</a>` : '';
    const youtubeLink = organizer.youtube ? `<a href="${organizer.youtube}" target="_blank" class="has-text-link is-flex is-align-items-center"><i class="lab la-youtube mr-2"></i>YouTubeチャンネル</a>` : '';
    const xLink = organizer.xId ? `<a href="https://x.com/${encodeURIComponent(organizer.xId)}" target="_blank" class="has-text-link is-flex is-align-items-center"><i class="lab la-twitter mr-2"></i>${escapeHtml(organizer.xId)}</a>` : '';
    const prefectureTag = organizer.prefecture ? `<span class="tag is-primary is-light is-size-7">${escapeHtml(organizer.prefecture)}</span>` : '';

    $('#organizer-page-content').append(`
        <div class="columns is-variable is-6 is-multiline mb-4">
            <div class="column">
                ${createOrganizerIcon(organizer)}
                <h2 class="title is-4 mb-2">${escapeHtml(organizer.orgName || '主催者情報')}</h2>
                <div class="content is-size-65">
                    <p>${prefectureTag}</p>
                    ${organizer.reserveL || organizer.reserveM || organizer.reserveN ? `<p class="mb-1"><strong>補足情報：</strong>${escapeHtml([organizer.reserveL, organizer.reserveM, organizer.reserveN].filter(Boolean).join(' / '))}</p>` : ''}
                    <div class="mt-2">
                        ${homepageLink ? `<div class="mb-2">${homepageLink}</div>` : ''}
                        ${youtubeLink ? `<div class="mb-2">${youtubeLink}</div>` : ''}
                        ${xLink ? `<div class="mb-2">${xLink}</div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `);
}

function appendOrganizerEventSections(upcoming, past) {
    $('#organizer-page-content').append(`
        <div class="section">
            <h3 class="title is-size-5">これから開催予定のイベント (${upcoming.length}件)</h3>
            <div id="organizer-events-upcoming" class="columns is-multiline"></div>
        </div>
        <div class="section">
            <h3 class="title is-size-5">過去のイベント (${past.length}件)</h3>
            <div id="organizer-events-past" class="columns is-multiline"></div>
        </div>
    `);

    appendOrganizerEventCards(upcoming, '#organizer-events-upcoming');
    appendOrganizerEventCards(past, '#organizer-events-past');
}

function createOrganizerIcon(organizer) {
    const iconUrl = String(organizer.orgIcon || '').trim();
    if (!iconUrl) {
        return `
            <figure class="image is-48x48">
                <div style="width:100%; height:100%; border-radius:50%; background:#dbdbdb;"></div>
            </figure>
        `;
    }
    return `
        <figure class="image is-48x48">
            <img class="is-rounded" src="${escapeHtml(iconUrl)}" alt="${escapeHtml(organizer.orgName || '主催者アイコン')}" style="width:100%; height:100%; object-fit:cover;" />
        </figure>
    `;
}

function appendOrganizerEventCards(events, target) {
    if (!events || events.length === 0) {
        $(target).append(`
            <div class="column is-full">
                <div class="notification is-warning is-light">
                    <p class="is-size-65">該当するイベントがありません。</p>
                </div>
            </div>
        `);
        return;
    }

    events.forEach((event) => {
        const eventDate = new Date(event['eventDate']);
        const formattedDate = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;
        const week = ['日', '月', '火', '水', '木', '金', '土'];
        const youbi = '(' + week[eventDate.getDay()] + ')';
        const eventTime = (event['eventStart'] || event['eventEnd']) ? `${event['eventStart'] || ''}${event['eventEnd'] ? ' - ' + event['eventEnd'] : ''}` : '';
        // 共通ヘルパーに合わせた変数定義
        const detailHref = getEventDetailHref(event);
        const imageArea = createImageDiv(event, 0);
        const categoryLabel = event['category'] || 'その他';
        const labelColor = {
            '大会': 'is-link',
            '大会（長期）': 'is-success',
            '体験会': 'is-light',
            '練習会': 'is-light',
            'ブース': 'is-light',
            'その他': 'is-light'
        }[categoryLabel] || 'is-light';
        const seriesName = event['seriesName'] ? `<span class="is-size-7 has-text-grey">${escapeHtml(event['seriesName'])}</span><br/>` : '';
        const org = event['org'] ? `<span class="is-size-7 has-text-grey"><i class="las la-user mr-1"></i>${escapeHtml(event['org'])}</span>` : '';
        const sourceLink = event['source'] ? `<a href="${event['source']}" target="_blank" class="card-footer-item is-size-65 p-2 has-text-weight-bold"><i class="las la-link"></i>ソース</a>` : '';
        const gCalUrl = createGoogleCalendarLink(event['eventDate'], event['eventStart'], event['eventEnd'], event['eventName'], event['article'] ? event['article'] : event['source']);
        const gCalLink = `<a href="${gCalUrl}" target="_blank" class="card-footer-item is-size-65 p-2 has-text-weight-bold"><i class="las la-plus-circle"></i>カレンダー</a>`;
        const articleLink = createArticleLink(event['article']);
        const detailLabel = createDetailLabel(event['article'], event['pickupSerial']);
        const dataTag = createDataTag(event);

        $(target).append(`
            <div class="column is-full">
                <div class="card mb-3 filter-item ${dataTag}">
                    <div class="card-image">
                        <div class="tag-overlay jaja-tags">
                            <span class="tag is-primary is-light is-size-7">${escapeHtml(event['prefecture'] || '')}</span>
                            <span class="tag ${labelColor} is-size-7">${escapeHtml(categoryLabel)}</span>
                            ${detailLabel}
                        </div>
                        ${imageArea}
                    </div>
                    <div class="card-content px-3 py-1">
                        <div class="content">
                            <span class="subtitle is-size-65"><i class="lar la-calendar"></i> ${formattedDate} <span class="has-text-grey">${youbi}</span> ${escapeHtml(eventTime)}</span>
                            <p class="title is-5 mb-0 mt-1 has-text-link"><a href="${detailHref}">${escapeHtml(event['eventName'] || '')}</a></p>
                            <p class="subtitle is-size-7 has-text-grey mb-2 mt-0">${seriesName}${org}</p>
                            <p class="is-fullwidth has-text-primary is-size-65 jaja-display-click mb-1 has-text-weight-semibold">
                                <span class="jaja-display-click-text">くわしくみる</span>
                                <i class="las la-angle-right is-size-6 ml-2 pt-1 has-text-primary"></i>
                            </p>
                            <div class="jaja-display-none jaja-display-target">
                                <div class="jaja-event-card-detail-list py-1 pl-1 jaja-event-detail-border">
                                    ${event['place'] ? `<p class="is-size-65 my-1"><strong>会場：</strong>${escapeHtml(event['place'])}</p>` : ''}
                                    ${eventTime ? `<p class="is-size-65 my-1"><strong>時間：</strong>${escapeHtml(eventTime)}</p>` : ''}
                                    ${event['entryFee'] ? `<p class="is-size-65 my-1"><strong>参加費：</strong>${escapeHtml(event['entryFee'])}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer class="card-footer">
                        ${sourceLink}
                        ${gCalLink}
                        ${articleLink}
                    </footer>
                </div>
            </div>
        `);
    });
}

function escapeHtml(text) {
    if (text === undefined || text === null) {
        return '';
    }
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
