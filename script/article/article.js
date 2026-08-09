$(async function () {
    const params = new URLSearchParams(window.location.search);
    const serial = params.get('serial') || params.get('id');
    await initEventDetailPage(serial);
});

async function initEventDetailPage(serial) {
    try {
        const events = await fetchEventDetail(serial);
        if (!events || events.length === 0) {
            appendEventNotFound();
            return;
        }

        appendEventDetail(events[0]);
    } catch (error) {
        console.error(error);
        appendEventNotFound();
    }
}

async function fetchEventDetail(serial) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.events;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((event) => {
                return String(event.serial ?? event.id ?? event.event_id ?? event.eventId ?? '') === String(serial || '');
            });
            resolve(filteredDatas);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            reject(new Error(`Failed to fetch event detail: ${textStatus}`));
        });
    });
}

function appendEventNotFound() {
    $('#event-detail-content').append(`
        <div class="notification is-danger is-light">
            <p class="title is-size-5">イベントが見つかりませんでした</p>
            <p class="is-size-65">指定されたイベントIDの情報を取得できませんでした。</p>
        </div>
    `);
}

function appendEventDetail(event) {
    const eventDate = new Date(event['eventDate']);
    const formattedDate = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;
    const week = ['日', '月', '火', '水', '木', '金', '土'];
    const youbi = '(' + week[eventDate.getDay()] + ')';

    const eventTime = (event['eventStart'] || event['eventEnd']) ? `${event['eventStart'] || ''}${event['eventEnd'] ? ' - ' + event['eventEnd'] : ''}` : '';
    const prefectureName = event['prefecture']?.slice(-3) === 'その他' ? event['prefecture']?.slice(0, -3) : event['prefecture'];
    const categoryLabel = event['category'] || 'その他';
    const labelColor = {
        '大会': 'is-link',
        '大会（長期）': 'is-success',
        '体験会': 'is-light',
        '練習会': 'is-light',
        'ブース': 'is-light',
        'その他': 'is-light'
    }[categoryLabel] || 'is-light';

    // 主催者表示（orgId があれば主催者ページへリンク）
    const organizerHtml = event['org'] ? (event['orgId'] ? `<a href="/organizer/?orgId=${encodeURIComponent(event['orgId'])}" class="has-text-link"><i class="las la-user mr-1"></i>${event['org']}</a>` : `<i class="las la-user mr-1"></i>${event['org']}`) : '';

    const imageHtml = event['image'] && String(event['image']).trim()
        ? `<a href="#" class="event-detail-image-link" data-image="${event['image']}" role="button">
            <figure class="image is-16by9" style="overflow: hidden; border-radius: 8px;">
                <img src="${event['image']}" alt="${event['eventName']}" style="object-fit: cover; width: 100%; height: 100%;" />
            </figure>
        </a>`
        : '';

    const sourceLink = event['source']
        ? `<p class="mb-0"><a href="${event['source']}" target="_blank" class="button is-small is-link is-light"><i class="las la-external-link-alt mr-1"></i>イベント発信元を開く</a></p>`
        : '';
    const articleLink = event['article']
        ? `<p class="mb-0"><a href="${event['article']}" target="_blank" class="button is-small is-primary is-light"><i class="las la-newspaper mr-1"></i>全国モルックカレンダーニュースの記事</a></p>`
        : '';
    const googleMapLink = event['place']
        ? `<p class="mb-0"><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event['prefecture'] + ' ' + event['place'])}" target="_blank" class="button is-small is-info is-light"><i class="las la-map-marked-alt mr-1"></i>Gooleマップ</a></p>`
        : '';
    const calendarLink = createGoogleCalendarLink(event['eventDate'], event['eventStart'], event['eventEnd'], event['eventName'], event['article'] || event['source']);

    const itemFields = [];
    const addItem = (label, value) => {
        if (value === undefined || value === null) {
            return;
        }
        const normalized = String(value).trim();
        if (!normalized) {
            return;
        }
        itemFields.push({ label, value: normalized });
    };

    addItem('開催日', `${formattedDate} ${youbi}`);
    addItem('時間', eventTime);
    addItem('都道府県', prefectureName);
    addItem('種別', categoryLabel);
    addItem('主催者', organizerHtml);
    addItem('会場', event['place']);
    addItem('サーフェス', event.ground);
    addItem('参加数', event.teamNum);
    addItem('ルール', createEventRuleText(event));

    const entryDetails = [];
    const addEntryDetail = (label, value) => {
        if (value === undefined || value === null) {
            return;
        }
        const normalized = String(value).trim();
        if (!normalized) {
            return;
        }
        entryDetails.push({ label, value: normalized });
    };

    addEntryDetail('開始', event['entryStart']);
    addEntryDetail('終了', event['entryEnd']);
    addEntryDetail('エントリー方法', event['entryMethod']);
    addEntryDetail('参加費', event['entryFee']);
    addEntryDetail('備考', event['entryRemarks']);

    if (entryDetails.length > 0) {
        const entryHtml = `
            <div class="pl-0 mt-1">
                ${entryDetails.map((detail) => `<p class="mb-1"><span class="has-text-weight-semibold">${detail.label}：</span>${detail.value}</p>`).join('')}
            </div>
        `;
        itemFields.push({ label: 'エントリー', value: entryHtml });
    }

    addItem('備考', event['remarks']);
    addItem('シリーズ', event['seriesName']);

    const verticalLabels = new Set(['エントリー', '備考']);

    const itemHtml = itemFields.map((item) => {
        if (verticalLabels.has(item.label)) {
            return `
        <div class="py-0 mb-2">
            <div class="mb-1">
                <span class="tag is-light has-text-weight-semibold is-small is-size-7">${item.label}</span>
            </div>
            <div class="has-text-grey-dark is-size-65 pl-3">${item.value}</div>
        </div>
    `;
        }

        return `
        <div class="py-0 mb-2">
            <div class="columns is-mobile is-vcentered is-gapless">
                <div class="column is-narrow">
                    <span class="tag is-light has-text-weight-semibold is-small is-size-7 mr-2">${item.label}</span>
                </div>
                <div class="column has-text-grey-dark is-size-65 pl-3">
                    ${item.value}
                </div>
            </div>
        </div>
    `;
    }).join('');

    const metadataHtml = [
        event['registerDate'] ? `<p class="is-size-7 has-text-grey mt-4 mb-1"><strong>追加日:</strong> ${formatDateOnly(event['registerDate'])}</p>` : '',
        event['updateDate'] ? `<p class="is-size-7 has-text-grey mb-0"><strong>更新日:</strong> ${formatDateOnly(event['updateDate'])}</p>` : ''
    ].filter(Boolean).join('');

    const warningMessageHtml = `
        <article class="message is-warning mb-4">
            <div class="message-body is-size-65">
                イベントに参加しようと思っている場合は、必ず主催者が発表する最新の情報を確認してください。以下に表示している内容は古いものである可能性があります。
            </div>
        </article>
    `;

    $('#event-detail-content').append(`
        <div>
            <div class="mb-4">
                ${warningMessageHtml}
                ${imageHtml ? `<div class="mb-4">${imageHtml}</div>` : ''}
            </div>
            <div class="tags mb-3">
                <span class="tag is-primary is-light">${prefectureName || '未設定'}</span>
                <span class="tag ${labelColor}">${categoryLabel}</span>
            </div>
            <h2 class="title is-size-4 mb-2">${event['eventName']}</h2>
            <p class="subtitle is-size-65 has-text-grey mb-4">${event['seriesName'] ? `<i class="las la-scroll mr-1"></i>${event['seriesName']}<br/>` : ''}${organizerHtml}</p>
            <div class="content">
                <div class="buttons are-small">
                    <a href="${calendarLink}" target="_blank" class="button is-small is-success is-light mb-0"><i class="las la-calendar-plus mr-1"></i>Goolgleカレンダー</a>
                    ${sourceLink}
                    ${articleLink}
                    ${googleMapLink}
                </div>
                <div class="p-1 has-background-white">
                    ${itemHtml}
                </div>
                ${metadataHtml}
            </div>
        </div>
        <div id="event-image-modal" class="modal">
            <div class="modal-background"></div>
            <div class="modal-content has-text-centered">
                <img id="event-image-modal-img" src="" alt="${event['eventName']}" style="max-height: 80vh; max-width: 100%; object-fit: contain; border-radius: 8px; background: white;" />
            </div>
            <button class="modal-close is-large" aria-label="close"></button>
        </div>
    `);

    $(document).on('click', '.event-detail-image-link', function (e) {
        e.preventDefault();
        const src = $(this).data('image');
        if (!src) {
            return;
        }
        $('#event-image-modal-img').attr('src', src);
        $('#event-image-modal').addClass('is-active');
    });

    $(document).on('click', '#event-image-modal .modal-background, #event-image-modal .modal-close', function () {
        $('#event-image-modal').removeClass('is-active');
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            $('#event-image-modal').removeClass('is-active');
        }
    });
}

function createEventRuleText(event) {
    const toText = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value).trim();
    };

    const composition = toText(event['composition']);
    const rule = toText(event['rule']);
    const min = toText(event['minMember']);
    const max = toText(event['maxMember']);

    if (composition.includes('チーム')) {
        const teamText = [
            min && max ? `${min}～${max}人` : min ? `${min}人` : max ? `～${max}人` : '',
            rule ? rule : ''
        ].filter(Boolean).join(' / ');
        return teamText ? `チーム（${teamText}）` : 'チーム';
    }

    const parts = [composition, rule].filter(Boolean);
    return parts.join(' / ');
}

function formatDateTime(value) {
    if (!value) {
        return '';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateOnly(value) {
    if (!value) {
        return '';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
