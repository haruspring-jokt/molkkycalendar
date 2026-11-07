const immediateEventPostUrl = 'https://molkkycalendar-user-post-event.cloud.run';
const immediateEventAuthCheckUrl = 'https://molkkycalendar-user-post-authid-check.cloud.run';

/** 掲載フォームを追加し、認証・コピー・送信の操作を登録する。 */
function appendImmediateEventPostModal() {
    if ($('#immediate-event-post-modal').length) {
        return;
    }

    $('body').append(createImmediateEventPostModalHtml());

    const $modal = $('#immediate-event-post-modal');
    const $form = $('#immediate-event-post-form');
    const $success = $('#immediate-event-post-success');
    const $error = $('#immediate-event-post-error');
    const $secretKey = $('#immediate-event-secret-key');
    const $submit = $('#immediate-event-post-submit');
    let authenticatedSecretKey = '';
    let organizerEvents = [];
    let authRequestId = 0;

    /** 認証欄のメッセージと表示色を更新する。 */
    const setAuthMessage = (message, type = '') => {
        $('#immediate-event-auth-message')
            .attr('class', `help is-inline is-size-65 ml-2${type ? ` is-${type}` : ''}`)
            .text(message);
    };
    /** 照合済み情報とコピー候補を消し、送信を無効にする。 */
    const resetAuthState = () => {
        authenticatedSecretKey = '';
        organizerEvents = [];
        $submit.prop('disabled', true);
        $secretKey.removeClass('is-success');
        $('#immediate-event-copy-field').addClass('is-hidden');
        $('#immediate-event-copy-events').empty().append(
            $('<option>').val('').text('イベントを選択してください')
        );
        $('#immediate-event-copy-message').text('');
        setAuthMessage('');
    };

    /** モーダルを閉じ、送信完了後はフォームを初期状態に戻す。 */
    const closeModal = () => {
        $modal.removeClass('is-active');
        $('html').removeClass('is-clipped');
        if (!$success.hasClass('is-hidden')) {
            $form[0].reset();
            authRequestId += 1;
            resetAuthState();
            $form.removeClass('is-hidden');
            $success.addClass('is-hidden');
        }
    };

    $('#open-immediate-event-post-modal').on('click', () => {
        if (isLocalDevelopmentHost()) {
            fillImmediateEventPostSampleData($form);
        }
        $modal.addClass('is-active');
        $('html').addClass('is-clipped');
        $('#immediate-event-secret-key').trigger('focus');
    });

    // 入力が変わった後に古い照合結果を受信しても、認証済みに戻さない。
    $secretKey.on('input', () => {
        authRequestId += 1;
        resetAuthState();
    });

    $secretKey.on('blur', () => {
        resetAuthState();
        const requestId = ++authRequestId;
        checkImmediateEventAuth($secretKey.val(), {
            requestId,
            isCurrent: (requestId) => requestId === authRequestId,
            setAuthMessage,
            setAuthenticatedOrganizer: (organizer, secretKey) => {
                authenticatedSecretKey = secretKey;
                $submit.prop('disabled', false);
                $secretKey.addClass('is-success');
                setAuthMessage(`認証しました。主催ID：${organizer.id} 主催名：${organizer.name}`, 'success');
            },
            showOrganizerEvents: (events) => {
                organizerEvents = events;
                const $select = $('#immediate-event-copy-events');
                $select.empty().append($('<option>').val('').text('イベントを選択してください'));
                events.forEach((event, index) => {
                    $select.append($('<option>').val(String(index)).text(
                        `（${normalizeImmediateEventDate(event.eventDate) || '日付未設定'}）${event.eventName || '名称未設定'}`
                    ));
                });
                $('#immediate-event-copy-field').removeClass('is-hidden');
                $('#immediate-event-copy-message').text(
                    events.length ? `コピー可能なイベント：${events.length}件` : 'コピーできるイベントはありません。'
                );
            }
        });
    });

    $('#immediate-event-copy-events').on('change', function () {
        const index = Number(this.value);
        if (this.value !== '' && Number.isInteger(index) && organizerEvents[index]) {
            copyImmediateEventFields($form, organizerEvents[index]);
        }
    });

    $modal.on('click', '[data-close-immediate-event-post]', () => {
        closeModal();
    });

    $(document).on('keydown.immediateEventPost', (event) => {
        if (event.key === 'Escape' && $modal.hasClass('is-active')) {
            closeModal();
        }
    });

    $form.on('submit', async (event) => {
        event.preventDefault();
        $error.addClass('is-hidden').text('');
        $success.addClass('is-hidden');

        const formData = new FormData($form[0]);
        const payload = Object.fromEntries(formData.entries());
        // ボタンの表示状態だけでなく、送信時の認証IDも照合済みの値と比較する。
        if (!authenticatedSecretKey || authenticatedSecretKey !== String(payload.secretKey || '').trim()) {
            resetAuthState();
            setAuthMessage('認証IDを確認してください。', 'danger');
            return;
        }

        const teamSizeMin = payload.teamSizeMin ? Number(payload.teamSizeMin) : null;
        const teamSizeMax = payload.teamSizeMax ? Number(payload.teamSizeMax) : null;
        if ((teamSizeMin !== null && (!Number.isInteger(teamSizeMin) || teamSizeMin < 1))
            || (teamSizeMax !== null && (!Number.isInteger(teamSizeMax) || teamSizeMax < 1))) {
            $error.text('チーム人数は1以上の自然数で入力してください。').removeClass('is-hidden');
            return;
        }
        if (teamSizeMin !== null && teamSizeMax !== null && teamSizeMin > teamSizeMax) {
            $error.text('チーム人数最少は最大以下の値を入力してください。').removeClass('is-hidden');
            return;
        }
        /** URLがHTTPまたはHTTPSか判定する。 */
        const isHttpUrl = (value) => {
            try {
                return ['http:', 'https:'].includes(new URL(value).protocol);
            } catch {
                return false;
            }
        };
        if (!isHttpUrl(payload.source) || (payload.image && !isHttpUrl(payload.image))) {
            $error.text('ソースとイベント画像URLは、httpまたはhttpsから始まるURLを入力してください。').removeClass('is-hidden');
            return;
        }

        const prefecture = payload.prefecture === 'A0'
            ? '海外'
            : JajaConstants.prefectureList[payload.prefecture];
        if (!prefecture) {
            $error.text('都道府県を選択してください。').removeClass('is-hidden');
            return;
        }

        payload.prefecture = prefecture;
        payload.teamSizeMin = teamSizeMin;
        payload.teamSizeMax = teamSizeMax;
        payload.rules = String(payload.rules || '').replace(/[\r\n\u3000]+/g, ' ').trim();

        $form.addClass('is-hidden');
        $success.removeClass('is-hidden');
        try {
            await postImmediateEvent(payload);
        } catch (error) {
            console.error('イベント作成リクエストの送信に失敗しました。', error);
            $success.addClass('is-hidden');
            $form.removeClass('is-hidden');
            $error.text(error instanceof TypeError
                ? '通信に失敗しました。時間をおいて再度お試しください。'
                : error.message).removeClass('is-hidden');
        }
    });
}

/** 認証IDを照合し、成功した主催者のコピー候補を読み込む。 */
async function checkImmediateEventAuth(secretKey, callbacks) {
    const normalizedSecretKey = String(secretKey || '').trim();
    if (!/^[A-Za-z0-9]{8}$/.test(normalizedSecretKey)) {
        callbacks.setAuthMessage(normalizedSecretKey
            ? '認証IDは半角英数字8桁で入力してください。'
            : '認証IDを入力してください。', 'danger');
        return;
    }

    callbacks.setAuthMessage('認証IDを確認しています…');
    try {
        const response = await fetch(immediateEventAuthCheckUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secretKey: normalizedSecretKey })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(response.status === 401
                ? '認証IDが正しくありません。認証IDをご確認ください。'
                : '認証IDの確認に失敗しました。時間をおいて再度お試しください。');
        }

        const organizer = result.organizer;
        if (!result.success || !organizer?.id || !organizer?.name) {
            throw new Error('認証結果を確認できませんでした。時間をおいて再度お試しください。');
        }
        // 後から開始した照合や入力変更があれば、この応答は画面に反映しない。
        if (!callbacks.isCurrent(callbacks.requestId)) {
            return;
        }

        callbacks.setAuthenticatedOrganizer(organizer, normalizedSecretKey);
        try {
            const events = await fetchImmediateOrganizerEvents(organizer.id);
            if (callbacks.isCurrent(callbacks.requestId)) {
                callbacks.showOrganizerEvents(events);
            }
        } catch (error) {
            if (!callbacks.isCurrent(callbacks.requestId)) {
                return;
            }
            console.error('主催者の既存イベント取得に失敗しました。', error);
            $('#immediate-event-copy-field').removeClass('is-hidden');
            $('#immediate-event-copy-message').text('既存イベントを取得できませんでした。時間をおいて再度お試しください。');
        }
    } catch (error) {
        if (!callbacks.isCurrent(callbacks.requestId)) {
            return;
        }
        console.error('認証IDの確認に失敗しました。', error);
        callbacks.setAuthMessage(error instanceof TypeError
            ? '通信に失敗しました。時間をおいて再度お試しください。'
            : error.message, 'danger');
    }
}

/** 指定した主催者のイベントを開催日の新しい順に取得する。 */
async function fetchImmediateOrganizerEvents(organizerId) {
    const response = await fetch(JajaConstants.molkkyCalendarStorage.events);
    if (!response.ok) {
        throw new Error(`events.json returned HTTP ${response.status}.`);
    }
    const events = await response.json();
    if (!Array.isArray(events)) {
        throw new Error('events.json has an invalid format.');
    }

    return events
        .filter((event) => event
            && String(event.orgId || '').toUpperCase() === String(organizerId).toUpperCase())
        .sort((left, right) => getImmediateEventDateTimestamp(right.eventDate)
            - getImmediateEventDateTimestamp(left.eventDate));
}

/** 開催日を並べ替え用の時刻に変換し、変換できない場合は0を返す。 */
function getImmediateEventDateTimestamp(value) {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

/** イベントJSONの項目を投稿フォームの対応する入力欄にコピーする。 */
function copyImmediateEventFields($form, event) {
    const fieldValues = {
        eventDate: normalizeImmediateEventDate(event.eventDate),
        eventStart: normalizeImmediateEventTime(event.eventStart),
        eventEnd: normalizeImmediateEventTime(event.eventEnd),
        category: event.category,
        seriesName: event.seriesName,
        source: event.source,
        eventName: event.eventName,
        prefecture: getImmediatePrefectureCode(event.prefecture),
        place: event.place,
        surface: event.ground,
        configuration: event.composition,
        teamSizeMin: event.minMember,
        teamSizeMax: event.maxMember,
        rules: event.rule,
        capacity: event.teamNum,
        entryStart: event.entryStart,
        entryEnd: event.entryEnd,
        entryMethod: event.entryMethod,
        entryFee: event.entryFee,
        entryOther: event.entryRemarks,
        remarks: event.remarks,
        image: event.image
    };

    Object.entries(fieldValues).forEach(([name, value]) => {
        const field = $form[0].elements.namedItem(name);
        if (field) {
            field.value = value === undefined || value === null ? '' : String(value);
        }
    });
}

/** イベントの日付をフォームと選択肢に使う年月日形式に変換する。 */
function normalizeImmediateEventDate(value) {
    const text = String(value || '');
    if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(text)) {
        const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/);
        return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : '';
    }
    // タイムゾーン付きの日時は、閲覧端末の設定によらず日本時間の日付にする。
    const date = new Date(text);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);
    const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

/** 時刻を入力欄で使えるHH:mm形式に変換する。 */
function normalizeImmediateEventTime(value) {
    const match = String(value || '').match(/(?:^|T|\s)(\d{1,2}):([0-5]\d)/);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '';
}

/** イベントの都道府県名をフォームの選択肢のコードに変換する。 */
function getImmediatePrefectureCode(value) {
    const prefecture = String(value || '').trim();
    if (prefecture === '海外' || prefecture === '【海外】') {
        return 'A0';
    }
    const normalizedPrefecture = prefecture.replace(/[都道府県]$/, '');
    const match = Object.entries(JajaConstants.prefectureList)
        .find(([, name]) => name === prefecture || name === normalizedPrefecture);
    return match ? match[0] : '';
}

/** 入力済みのイベント情報を掲載リクエストとして送信する。 */
async function postImmediateEvent(payload) {
    const response = await fetch(immediateEventPostUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const message = response.status === 401
            ? '認証IDが正しくありません。認証IDをご確認ください。'
            : '送信に失敗しました。時間をおいて再度お試しください。';
        throw new Error(message);
    }
}

/** ローカル開発用のホストで表示しているか判定する。 */
function isLocalDevelopmentHost() {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

/** ローカルでの画面確認用にフォームへサンプル値を設定する。 */
function fillImmediateEventPostSampleData($form) {
    const eventDate = getOneMonthFromToday();
    const sampleData = {
        eventDate,
        eventStart: '09:00',
        eventEnd: '17:00',
        category: '大会',
        seriesName: 'テスト用：全国モルックカレンダーカップ',
        source: 'https://jajapatatas.com',
        eventName: 'サンプル モルック大会',
        prefecture: '13',
        place: 'サンプル公園 多目的広場',
        surface: '公園芝生',
        configuration: 'チーム',
        teamSizeMin: 2,
        teamSizeMax: 4,
        rules: '参加条件なし。初心者歓迎。',
        capacity: '優先枠：10チーム、一般枠：20チーム',
        entryStart: getTodayInInputDateFormat(),
        entryEnd: eventDate,
        entryMethod: 'Googleフォーム',
        entryFee: '1チーム3,000円',
        entryOther: '定員に達し次第、受付を終了します。',
        remarks: 'これはローカル確認用のサンプルデータです。',
        image: 'https://pbs.twimg.com/profile_banners/1658728560436330502/1763560515/1500x500'
    };

    Object.entries(sampleData).forEach(([name, value]) => {
        $form[0].elements.namedItem(name).value = value;
    });
}

/** 今日の日付を日付入力欄の形式で返す。 */
function getTodayInInputDateFormat() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** 掲載フォームを含むモーダルのHTMLを作成する。 */
function createImmediateEventPostModalHtml() {
    return `
        <div class="modal" id="immediate-event-post-modal" role="dialog" aria-modal="true"
            aria-labelledby="immediate-event-post-title">
            <div class="modal-background" data-close-immediate-event-post></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title"
                        id="immediate-event-post-title"><span class="is-size-5">イベント掲載（認証済み主催者向け）</span></p>
                    <button type="button" class="delete" aria-label="閉じる" data-close-immediate-event-post></button>
                </header>
                <section class="modal-card-body is-size-65">
                    ${createImmediateEventPostGuide()}
                    <div class="notification is-success is-light is-hidden"
                        id="immediate-event-post-success" role="status">
                        イベント作成リクエストを送信しました。イベントの反映は数時間～1日後の見込みです。</br>
                        新しいイベントは、以下のページから確認することができます。
                        <a href="https://jajapatatas.com/recent" target="_blank"
                            rel="noopener noreferrer">新しいイベント一覧</a>
                    </div>
                    <div class="notification is-danger is-light is-hidden"
                        id="immediate-event-post-error" role="alert"></div>
                    <form id="immediate-event-post-form">
                        ${createImmediateEventPostFormFields()}
                    </form>
                </section>
                <footer class="modal-card-foot is-justify-content-flex-end">
                    <button type="button" class="button" data-close-immediate-event-post>閉じる</button>
                </footer>
            </div>
        </div>
    `;
}

/** 掲載手順と認証IDの案内のHTMLを作成する。 */
function createImmediateEventPostGuide() {
    return `
        <article class="message is-dark">
            <div class="message-body px-3 content is-size-65">
                <p>フォーム送信から30分～数日でHPに反映されます。</pr>
                <p>このフォームでイベントを掲載するには、認証IDが必要です。<br>
                認証IDは、以下のメールアドレス、またはXのアカウントにDMで発行の依頼をしてください。</p>
                <ul>
                    <li><a class="has-text-link" href="mailto:contact@jajapatatas.com">contact@jajapatatas.com</a></li>
                    <li><a class="has-text-link" href="https://x.com/molkkycalendar" target="_blank"
                        rel="noopener noreferrer">https://x.com/molkkycalendar</a></li>
                </ul>
                <p>認証IDは、主催者がイベントカレンダーに掲載されたことがある場合に発行可能です。<br>
                <i class="las la-exclamation has-text-primary"></i><strong class="has-text-primary">
                    新規の主催者は、まずはこれまでのイベント掲載申請フォーム（Googleフォーム）から申請を依頼してください。</strong></p>
            </div>
        </article>
    `;
}

/** 認証欄、コピー欄、イベント情報の入力項目を作成する。 */
function createImmediateEventPostFormFields() {
    const categoryOptions = [
        { value: '大会', label: '大会' },
        { value: '大会（長期）', label: '大会（長期）' },
        { value: '練習会', label: '練習会' },
        { value: '体験会', label: '体験会' },
        { value: 'その他', label: 'その他' },
        { value: 'ブース', label: 'ブース' }
    ];
    const configurationOptions = [
        { value: '個人', label: '個人' },
        { value: 'チーム', label: 'チーム' }
    ];
    const prefectureOptions = JajaConstants.areaSelects
        .filter((area) => /^\d{2}$/.test(area.key) || area.key === 'A0')
        .map((area) => ({ value: area.key, label: area.key === 'A0' ? '海外' : area.text }));
    const defaultEventDate = getOneMonthFromToday();

    return `
        <article class="message is-primary">
            <div class="message-body px-3">
                ${createImmediateEventPostInputField('認証ID', 'secretKey', 'password', true)}
                <div class="field is-hidden" id="immediate-event-copy-field">
                    ${createImmediateEventPostLabel('既存のイベントをコピー', 'immediate-event-copy-events')}
                    <p class="help">既存のイベントをコピーして入力する</p>
                    <div class="control select is-fullwidth is-size-65">
                        <select class="is-size-65" id="immediate-event-copy-events">
                            <option value="">イベントを選択してください</option>
                        </select>
                    </div>
                    <p class="help" id="immediate-event-copy-message"></p>
                </div>
            </div>
        </article>
        ${createImmediateEventPostInputField('開催日付', 'eventDate', 'date', true, '', {
        value: defaultEventDate
    })}
        <div class="columns my-1">
            <div class="column py-1">${createImmediateEventPostInputField('開始時間', 'eventStart', 'time', false, '', {
        value: '09:00',
        fieldClass: 'mb-1'
    })}</div>
            <div class="column py-1">${createImmediateEventPostInputField('終了時間', 'eventEnd', 'time', false, '', {
        value: '17:00',
        fieldClass: 'mb-1'
    })}</div>
        </div>
        ${createImmediateEventPostSelectField('種別', 'category', categoryOptions, true)}
        ${createImmediateEventPostInputField('イベントシリーズ', 'seriesName', 'text', false, '', {
        helpText: '長期大会や定期的に開催されている大会の場合、その名称を入力'
    })}
        ${createImmediateEventPostInputField('ソース（告知ページ）', 'source', 'url', true, 'https://example.com')}
        ${createImmediateEventPostInputField('イベント名称', 'eventName', 'text', true)}
        ${createImmediateEventPostSelectField('都道府県', 'prefecture', prefectureOptions, true)}
        ${createImmediateEventPostInputField('開催場所', 'place')}
        ${createImmediateEventPostInputField('サーフェス', 'surface', 'text', false, '', {
        helpText: 'クレー、公園芝生、天然芝、人工芝、ビーチ、室内、など'
    })}
        ${createImmediateEventPostSelectField('構成', 'configuration', configurationOptions)}
        <div class="columns my-1">
            <div class="column py-1">${createImmediateEventPostInputField(
        'チーム人数最少', 'teamSizeMin', 'number', false, '', {
        attributes: 'min="1" step="1"',
        fieldClass: 'mb-1'
    })}</div>
            <div class="column py-1">${createImmediateEventPostInputField(
        'チーム人数最大', 'teamSizeMax', 'number', false, '', {
        attributes: 'min="1" step="1"',
        fieldClass: 'mb-1'
    })}</div>
        </div>
        ${createImmediateEventPostTextareaField('ルール・参加条件', 'rules')}
        ${createImmediateEventPostInputField('定員', 'capacity', 'text', false, '', {
        helpText: '参加上限の人数またはチーム数。「優先枠：XX、一般枠：YY」のような自由な記載でもよい。'
    })}
        ${createImmediateEventPostInputField('エントリー開始日', 'entryStart', 'text', false, '', {
        helpText: '日時、先行抽選開始日など自由に入力可'
    })}
        ${createImmediateEventPostInputField('エントリー終了日', 'entryEnd')}
        ${createImmediateEventPostInputField('エントリー媒体', 'entryMethod')}
        ${createImmediateEventPostInputField('エントリー参加費', 'entryFee', 'text', false, '', {
        helpText: '割引条件など自由に入力可'
    })}
        ${createImmediateEventPostTextareaField('エントリーその他', 'entryOther')}
        ${createImmediateEventPostTextareaField('備考', 'remarks')}
        ${createImmediateEventPostInputField('イベント画像URL', 'image', 'url', false, 'https://example.com/image.jpg', {
        helpText: '公開されている画像URLを入力'
    })}
        <p class="help mb-4">フォーム送信後、イベントの反映まで数時間～1日ほどかかる見込みです。</p>
        <div class="field">
            <div class="control">
                <button class="button is-primary is-fullwidth is-size-6"
                    id="immediate-event-post-submit" type="submit" disabled>イベント作成リクエストを送信</button>
            </div>
        </div>
    `;
}

/** 今日の1か月後を日付入力欄の形式で返す。 */
function getOneMonthFromToday() {
    const date = new Date();
    const dayOfMonth = date.getDate();
    const targetMonth = date.getMonth() + 1;
    // 翌月に同じ日がない場合は月末に合わせ、月をまたぐ繰り上がりを防ぐ。
    date.setDate(1);
    date.setMonth(targetMonth);
    const lastDayOfTargetMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(dayOfMonth, lastDayOfTargetMonth));

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** ラベルや説明文を含む入力欄のHTMLを作成する。 */
function createImmediateEventPostInputField(
    label, name, type = 'text', required = false, placeholder = '', options = {}
) {
    const id = `immediate-event-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    const requiredAttribute = required ? 'required' : '';
    const placeholderAttribute = placeholder ? `placeholder="${placeholder}"` : '';
    const keyAttributes = name === 'secretKey'
        ? 'minlength="8" maxlength="8" pattern="[A-Za-z0-9]{8}" autocomplete="off" title="半角英数字8桁で入力してください"'
        : options.attributes || '';
    const valueAttribute = options.value ? `value="${options.value}"` : '';
    const helpText = options.helpText || (name === 'secretKey'
        ? '事前に配布された8桁の英数字を入力してください。'
        : '');
    const fieldClass = options.fieldClass || '';

    return `
        <div class="field ${fieldClass}">
            ${name === 'secretKey'
            ? `<div class="mb-2">${createImmediateEventPostLabel(label, id, required, true)}`
            + '<span class="help is-inline is-size-65 ml-2"'
            + ' id="immediate-event-auth-message" role="status"></span></div>'
            : createImmediateEventPostLabel(label, id, required)}
            <div class="control">
                <input class="input is-size-65" id="${id}" name="${name}" type="${type}"
                    ${requiredAttribute} ${placeholderAttribute} ${valueAttribute} ${keyAttributes}>
            </div>
            ${helpText ? `<p class="help">${helpText}</p>` : ''}
        </div>
    `;
}

/** ラベル付きの複数行入力欄を作成する。 */
function createImmediateEventPostTextareaField(label, name) {
    const id = `immediate-event-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    return `
        <div class="field">
            ${createImmediateEventPostLabel(label, id)}
            <div class="control"><textarea class="textarea is-size-65" id="${id}" name="${name}"></textarea></div>
        </div>
    `;
}

/** ラベル付きの選択欄を作成する。 */
function createImmediateEventPostSelectField(label, name, options, required = false) {
    const id = `immediate-event-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    const requiredAttribute = required ? 'required' : '';
    const optionHtml = options
        .map((option) => `<option value="${option.value}">${option.label}</option>`)
        .join('');

    return `
        <div class="field">
            ${createImmediateEventPostLabel(label, id, required)}
            <div class="control select is-fullwidth is-size-65">
                <select class="is-size-65" id="${id}" name="${name}" ${requiredAttribute}>
                    <option value="">選択してください</option>
                    ${optionHtml}
                </select>
            </div>
        </div>
    `;
}

/** アイコンと必須表示を含む入力項目のラベルを作成する。 */
function createImmediateEventPostLabel(label, id, required = false, inline = false) {
    const requiredLabel = required ? ' <span class="has-text-danger">必須</span>' : '';
    const iconClass = required ? 'las la-edit is-danger has-text-danger' : 'las la-edit';
    return `<label class="label is-size-65${inline ? ' is-inline' : ''}" for="${id}">`
        + `<i class="${iconClass}" aria-hidden="true"></i> ${label}${requiredLabel}</label>`;
}
