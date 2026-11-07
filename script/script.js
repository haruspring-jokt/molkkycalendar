

$(function () {
    commonPageSetting();
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
    initAmazonBox();
    // 共通の詳細開閉ハンドラを初期化
    if (typeof detailOpenEvent === 'function') {
        detailOpenEvent();
    }
});

function commonPageSetting() {
    appendHeader();
    appendFooter();
}

function getRelativePathToSiteRoot() {
    const normalizedPath = (location.pathname || '/').replace(/index\.html$/i, '').replace(/\/+$/, '');
    const segments = normalizedPath.split('/').filter(Boolean);
    return segments.length === 0 ? './' : '../'.repeat(segments.length);
}

function getEventIdentifier(event) {
    return event?.serial ?? event?.id ?? event?.event_id ?? event?.eventId ?? event?.eventID ?? '';
}

function getEventDetailHref(event) {
    const serial = getEventIdentifier(event);
    if (!serial) {
        return '#';
    }
    return `${getRelativePathToSiteRoot()}article/?serial=${encodeURIComponent(serial)}`;
}

function createAutoCreatedEventIcon(event) {
    return event['isAutoCreated'] === true
        ? ' <i class="las la-robot has-text-primary" aria-label="自動投稿"></i>'
        : '';
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

function createImageDiv(event, i) {
    if (event['image']) {
        const detailHref = getEventDetailHref(event);
        return `
            <figure class="image is-fullwidth jaja-card-image">
                <a class="" href="${detailHref}">
                    <img src="${event['image']}" alt="image of ${event['eventName']}" />
                </a>
            </figure>
        `;
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

function createDetailLabel(article, pickupSerial) {
    if (article || pickupSerial) {
        return `
            <span class="tag m-1 is-warning shadow has-text-weight-bold">注目</span>
        `;
    } else {
        return '';
    }
}

/*
 * ===================================================
 * 全ページの共通設定
 * ===================================================
 */

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
        video: "./video/",
        points: "./points/",
        jajablog: JajaConstants.blog,
        twitter: JajaConstants.twitter,
        youtube: JajaConstants.youtube,
        suzuri: JajaConstants.suzuri,
        archive2026: JajaConstants.archive2026,
        archive2025: JajaConstants.archive2025,
        archive2024: JajaConstants.archive2024,
        archive2023: JajaConstants.archive2023,
        formFormat: JajaConstants.formFormat,
        formFree: JajaConstants.formFree,
        scoresheet: JajaConstants.scoresheet,
        molkkyprime: JajaConstants.molkkyprime,
    };

    // 階層調整処理
    const addPath = getRelativePathToSiteRoot();
    Object.keys(links).forEach((key) => {
        if (!links[key].startsWith("http")) {
            links[key] = addPath + links[key];
        }
    });

    // ヘッダーHTMLをテンプレートリテラルで定義
    const headerHtml = `
        <nav class="navbar is-fixed-top is-primary" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item" href="${links.top}">
                    <img src="${links.logo}" alt="jajapatatas logo" />
                </a>
                <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                    <span aria-hidden="true" class="has-text-light"></span>
                    <span aria-hidden="true" class="has-text-light"></span>
                    <span aria-hidden="true" class="has-text-light"></span>
                    <span aria-hidden="true" class="has-text-light"></span>
                </a>
            </div>
            <div id="navbarBasicExample" class="navbar-menu">
                <div class="navbar-start">
                    <a class="navbar-item has-text-light" href="${links.recent}">新規イベント</a>
                    <a class="navbar-item has-text-light" href="${links.simple}">シンプル版</a>
                    <a class="navbar-item has-text-light" href="${links.video}">動画・ライブ</a>
                    <a class="navbar-item has-text-light" href="${links.points}">ポイントランキング</a>
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link has-text-light">More</a>
                        <div class="navbar-dropdown">
                            <a class="navbar-item has-text-primary-50" href="${links.jajablog}" target="_blank">全国モルックカレンダーニュースブログ</a>
                            <a class="navbar-item has-text-primary-50" href="${links.archive2026}" target="_blank">過去のイベント 2026年版</a>
                            <a class="navbar-item has-text-primary-50" href="${links.archive2025}" target="_blank">過去のイベント 2025年版</a>
                            <a class="navbar-item has-text-primary-50" href="${links.archive2024}" target="_blank">過去のイベント 2024年版</a>
                            <a class="navbar-item has-text-primary-50" href="${links.archive2023}" target="_blank">過去のイベント 2023年版</a>
                            <a class="navbar-item has-text-primary-50" href="${links.formFormat}" target="_blank">掲載申請フォーム</a>
                            <a class="navbar-item has-text-primary-50" href="${links.formFree}" target="_blank">掲載申請フォーム（フリーフォーマット）</a>
                            <a class="navbar-item has-text-primary-50" href="${links.formOther}" target="_blank">その他お問い合わせ</a>
                        </div>
                    </div>
                </div>
                <div class="navbar-end">
                    <div class="navbar-item">
                        <div class="buttons columns">
                            <a class="column button is-info" target="_blank" href="${links.twitter}">Twitter(X)</a>
                            <a class="column button is-danger" target="_blank" href="${links.youtube}"><span class="has-text-light">YouTube</span></a>
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
        archive2026: JajaConstants.archive2026,
        archive2025: JajaConstants.archive2025,
        archive2024: JajaConstants.archive2024,
        archive2023: JajaConstants.archive2023,
        formFormat: JajaConstants.formFormat,
        formFree: JajaConstants.formFree,
        scoresheet: JajaConstants.scoresheet,
        molkkyprime: JajaConstants.molkkyprime,
    };

    // 階層によるパス調整
    const addPath = getRelativePathToSiteRoot();
    Object.keys(links).forEach((key) => {
        if (!links[key].startsWith("http")) {
            links[key] = addPath + links[key];
        }
    });

    const textSize = "is-size-65";
    const textClass = "has-text-light";
    // フッターHTMLを一括生成
    const footerHtml = `
        <div class="columns" id="site-map">
            <ul class="content column has-text-light"><strong class="has-text-weight-bold has-text-light">全国モルックカレンダー</strong>
                <li><a class="content ${textSize} ${textClass}" href="${links.top}">トップ</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.recent}">新規イベント</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.simple}">シンプル版</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.video}">動画・ライブ</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.points}">独自ポイントランキング</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.archive2026}" target="_blank">過去のイベント 2026年版</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.archive2025}" target="_blank">過去のイベント 2025年版</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.archive2024}" target="_blank">過去のイベント 2024年版</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.archive2023}" target="_blank">過去のイベント 2023年版</a></li>
            </ul>
            <ul class="content column has-text-light"><strong class="has-text-weight-bold has-text-light">主催者向けイベント掲載申請</strong>
                <li><a class="content ${textSize} ${textClass}" href="${links.formFormat}" target="_blank">掲載申請フォーム</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.formFree}" target="_blank">掲載申請フォーム（フリーフォーマット）</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.formOther}" target="_blank">その他お問い合わせ</a></li>
            </ul>
            <ul class="content column has-text-light"><strong class="has-text-weight-bold has-text-light">リンク</strong>
                <li><a class="content ${textSize} ${textClass}" href="${links.youtube}" target="_blank">YouTube</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.twitter}" target="_blank">Twitter(X)</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.suzuri}" target="_blank">SUZURI</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.jajablog}" target="_blank">全国モルックカレンダーニュースブログ</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.scoresheet}" target="_blank">モルック用スコアシートPDF</a></li>
                <li><a class="content ${textSize} ${textClass}" href="${links.molkkyprime}" target="_blank">モルック関東プライムリーグ</a></li>
            </ul>
        </div>
        <p class="content is-size-7 has-text-light is-pulled-right">2024 全国モルックカレンダー Mölkky clan jaja patatas</p>
    `;

    // フッターに追加
    $("#jaja-footer").append(footerHtml);
    $('.footer').addClass('has-background-primary');
}

function appendCommonEventInfoForm() {
    $(".jaja-calendar-event-info-form").append(`
            <p class="m-2">
                <button type="button" class="button is-success has-text-white-bis is-fullwidth is-small" id="open-immediate-event-post-modal">
                    <i class="las la-bolt mx-1 is-size-5"></i>イベント掲載（認証済み主催者向け）
                </button>
            </p>
            <p class="m-2">
                <a class=""
                    href="${JajaConstants.formFormat}"
                    target="_blank"><button class="button is-success is-fullwidth is-outlined is-small">
                        <i class="las la-file-upload mx-1 is-size-5 has-text-success"></i>イベント掲載申請（項目別）</button></a>
            </p>
            <p class="m-2">
                <a class=""
                    href="${JajaConstants.formFree}"
                    target="_blank"><button class="button is-success is-fullwidth is-outlined is-small">
                        <i class="las la-file-upload mx-1 is-size-5 has-text-success"></i>イベント掲載申請（フリーフォーム）</button></a>
            </p>
            <p class="m-2">
                <a class=""
                    href="${JajaConstants.formOther}"
                    target="_blank"><button class="button is-success is-fullwidth is-outlined is-small">
                        <i class="las la-file-upload mx-1 is-size-5 has-text-success"></i>その他各種お問い合わせ</button></a>
            </p>
        `);
    appendImmediateEventPostModal();
}

function appendImmediateEventPostModal() {
    if ($('#immediate-event-post-modal').length) {
        return;
    }

    $('body').append(createImmediateEventPostModalHtml());

    const $modal = $('#immediate-event-post-modal');
    const $form = $('#immediate-event-post-form');
    const $success = $('#immediate-event-post-success');
    const $error = $('#immediate-event-post-error');
    const closeModal = () => {
        $modal.removeClass('is-active');
        $('html').removeClass('is-clipped');
        if (!$success.hasClass('is-hidden')) {
            $form[0].reset();
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

        const prefecture = JajaConstants.prefectureList[payload.prefecture];
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
            const response = await fetch('https://molkkycalendar-user-post-event.cloud.run', {
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

function isLocalDevelopmentHost() {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

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

function getTodayInInputDateFormat() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function createImmediateEventPostModalHtml() {
    return `
        <div class="modal" id="immediate-event-post-modal" role="dialog" aria-modal="true" aria-labelledby="immediate-event-post-title">
            <div class="modal-background" data-close-immediate-event-post></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title" id="immediate-event-post-title"><span class="is-size-5">イベント掲載（認証済み主催者向け）</span></p>
                    <button type="button" class="delete" aria-label="閉じる" data-close-immediate-event-post></button>
                </header>
                <section class="modal-card-body is-size-65">
                    ${createImmediateEventPostGuide()}
                    <div class="notification is-success is-light is-hidden" id="immediate-event-post-success" role="status">
                        イベント作成リクエストを送信しました。イベントの反映は数時間～1日後の見込みです。</br>
                        新しいイベントは、以下のページから確認することができます。
                        <a href="https://jajapatatas.com/recent" target="_blank" rel="noopener noreferrer">新しいイベント一覧</a>
                    </div>
                    <div class="notification is-danger is-light is-hidden" id="immediate-event-post-error" role="alert"></div>
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

function createImmediateEventPostGuide() {
    return `
        <div class="content is-size-65">
            <p>フォーム送信から数時間～数日でHPに反映されます。</pr>
            <p>このフォームでイベントを掲載するには、認証キーが必要です。<br>
            認証キーは、以下のメールアドレス、またはXのアカウントにDMで発行の依頼をしてください。</p>
            <ul>
                <li><a href="mailto:contact@jajapatatas.com">contact@jajapatatas.com</a></li>
                <li><a href="https://x.com/molkkycalendar" target="_blank" rel="noopener noreferrer">https://x.com/molkkycalendar</a></li>
            </ul>
            <p>認証キーは、主催者がイベントカレンダーに掲載されたことがある場合に発行可能です。<br>
            新規の主催者は、まずはこれまでのイベント掲載申請フォーム（Googleフォーム）から申請を依頼してください。</p>
        </div>
    `;
}

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
        .filter((area) => /^\d{2}$/.test(area.key) && area.key !== '00')
        .map((area) => ({ value: area.key, label: area.text }));
    const defaultEventDate = getOneMonthFromToday();

    return `
        ${createImmediateEventPostInputField('認証ID', 'secretKey', 'password', true)}
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
            <div class="column py-1">${createImmediateEventPostInputField('チーム人数最少', 'teamSizeMin', 'number', false, '', {
                attributes: 'min="1" step="1"',
                fieldClass: 'mb-1'
            })}</div>
            <div class="column py-1">${createImmediateEventPostInputField('チーム人数最大', 'teamSizeMax', 'number', false, '', {
                attributes: 'min="1" step="1"',
                fieldClass: 'mb-1'
            })}</div>
        </div>
        ${createImmediateEventPostTextareaField('ルール・参加条件', 'rules')}
        ${createImmediateEventPostInputField('定員', 'capacity', 'text', false, '', {
            helpText: '参加上限の人数またはチーム数。「優先枠：XX、一般枠：YY」のような自由な記載でもよい。'
        })}
        ${createImmediateEventPostInputField('エントリー開始日', 'entryStart')}
        ${createImmediateEventPostInputField('エントリー終了日', 'entryEnd')}
        ${createImmediateEventPostInputField('エントリー媒体', 'entryMethod')}
        ${createImmediateEventPostInputField('エントリー参加費', 'entryFee')}
        ${createImmediateEventPostTextareaField('エントリーその他', 'entryOther')}
        ${createImmediateEventPostTextareaField('備考', 'remarks')}
        ${createImmediateEventPostInputField('イベント画像URL', 'image', 'url', false, 'https://example.com/image.jpg')}
        <p class="help mb-4">フォーム送信後、イベントの反映まで数時間～1日ほどかかる見込みです。</p>
        <div class="field">
            <div class="control">
                <button class="button is-primary is-fullwidth is-size-6" id="immediate-event-post-submit" type="submit">イベント作成リクエストを送信</button>
            </div>
        </div>
    `;
}

function getOneMonthFromToday() {
    const date = new Date();
    const dayOfMonth = date.getDate();
    const targetMonth = date.getMonth() + 1;
    date.setDate(1);
    date.setMonth(targetMonth);
    const lastDayOfTargetMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(dayOfMonth, lastDayOfTargetMonth));

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function createImmediateEventPostInputField(label, name, type = 'text', required = false, placeholder = '', options = {}) {
    const id = `immediate-event-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    const requiredAttribute = required ? 'required' : '';
    const requiredLabel = required ? ' <span class="has-text-danger">必須</span>' : '';
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
            <label class="label is-size-65" for="${id}">${label}${requiredLabel}</label>
            <div class="control">
                <input class="input" id="${id}" name="${name}" type="${type}" ${requiredAttribute} ${placeholderAttribute} ${valueAttribute} ${keyAttributes}>
            </div>
            ${helpText ? `<p class="help">${helpText}</p>` : ''}
        </div>
    `;
}

function createImmediateEventPostTextareaField(label, name) {
    const id = `immediate-event-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    return `
        <div class="field">
            <label class="label is-size-65" for="${id}">${label}</label>
            <div class="control"><textarea class="textarea" id="${id}" name="${name}"></textarea></div>
        </div>
    `;
}

function createImmediateEventPostSelectField(label, name, options, required = false) {
    const id = `immediate-event-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    const requiredAttribute = required ? 'required' : '';
    const requiredLabel = required ? ' <span class="has-text-danger">必須</span>' : '';
    const optionHtml = options
        .map((option) => `<option value="${option.value}">${option.label}</option>`)
        .join('');

    return `
        <div class="field">
            <label class="label is-size-65" for="${id}">${label}${requiredLabel}</label>
            <div class="control select is-fullwidth">
                <select id="${id}" name="${name}" ${requiredAttribute}>
                    <option value="">選択してください</option>
                    ${optionHtml}
                </select>
            </div>
        </div>
    `;
}

function appendCommonPointsSiteLinks() {
    const depth = location.pathname.split("/").length - 1;
    const addPath = (depth === 2 ? "../" : depth === 3 ? "../../" : "");
    $(".jaja-calendar-points-site-links").append(`
            <p class="m-2">
                <a class="" href="${addPath}"><button class="button is-primary is-fullwidth is-small">
                        <i class="las la-calendar-check mx-1 is-size-5 has-text-light"></i>
                        <span class="has-text-light">全国モルックカレンダートップ</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="${JajaConstants.blog}" target="_blank"><button
                        class="button is-primary is-fullwidth is-small"><i
                            class="las la-newspaper mx-1 is-size-5 has-text-light"></i>
                        <span class="has-text-light">全国モルックカレンダーニュースブログ</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="${JajaConstants.twitter}" target="_blank"><button
                        class="button is-info is-fullwidth is-small"><i
                            class="lab la-twitter mx-1 is-size-5"></i><span class="">X（Twitter）
                            @molkkycalendar</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="${JajaConstants.scoresheet}"
                    target="_blank"><button class="button is-info is-fullwidth is-small">
                        <i class="las la-file-pdf mx-1 is-size-5"></i>
                        <span class="">モルック用スコアシートPDF</span></button></a>
            </p>
        `);
}

function appendCommonPointsInfoForm() {
    $(".jaja-calendar-points-info-form").append(`
            <p class="m-2">
                <a class="" href="https://forms.gle/Kx1eHh6WjE5MMCJL9" target="_blank"><button
                        class="button is-danger is-fullwidth is-small"><i
                            class="las la-file-upload mx-1 is-size-5 has-text-light"></i>
                        <span class="has-text-light">大会結果申請フォーム</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="${document.location.origin}/points/tournament/list"><button
                        class="button is-dark is-fullwidth is-small is-outlined"><i
                            class="las la-medal mx-1 is-size-5"></i>
                        <span class="">大会結果一覧</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="https://blog.jajapatatas.com/entry/announce/pointsystem"
                    target="_blank"><button class="button is-dark is-fullwidth is-small is-outlined">
                        <i class="las la-question mx-1 is-size-5"></i>申請方法について</button></a>
            </p>
        `);
}

function appendCommonSiteLinks() {
    const depth = location.pathname.split("/").length - 1;
    const addPath = (depth === 2 ? "../." : depth === 3 ? "../../." : "") + "/points";
    $(".jaja-calendar-site-links").append(`
            <p class="m-2">
                <a class="" href="${addPath}"><button class="button is-danger is-fullwidth is-small">
                        <i class="las la-trophy has-text-light mx-1 is-size-5"></i>
                        <span class="has-text-light">独自ポイントランキング</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="${JajaConstants.blog}" target="_blank"><button
                        class="button is-primary is-fullwidth is-small"><i
                            class="las la-newspaper mx-1 is-size-5 has-text-light"></i>
                        <span class="has-text-light">全国モルックカレンダーニュースブログ</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="${JajaConstants.twitter}" target="_blank"><button
                        class="button is-info is-fullwidth is-small"><i
                            class="lab la-twitter mx-1 is-size-5"></i><span class="">X（Twitter）
                            @molkkycalendar</span></button></a>
            </p>
            <p class="m-2">
                <a class="" href="${JajaConstants.scoresheet}"
                    target="_blank"><button class="button is-info is-fullwidth is-small">
                        <i class="las la-file-pdf mx-1 is-size-5"></i>
                        <span class="">モルック用スコアシートPDF</span></button></a>
            </p>
        `);
}

function appendCommonGoogleAds() {
    $(".jaja-calendar-google-ads").append(`
            <script async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8922718369591652"
                crossorigin="anonymous"></script>
            <!-- 横長 タイプA -->
            <ins class="adsbygoogle" style="display:ruby-text" data-ad-client="ca-pub-8922718369591652"
                data-ad-slot="9630561909" data-ad-format="horizontal" data-full-width-responsive="false"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        `);
}

/**
 * 共通Amazonリンク作成
 * @returns 
 */
function initAmazonBox() {
    const amazons = JajaConstants.amazonBoxList;
    if (!amazons || amazons.length === 0) {
        return;
    }
    const randIndex = Math.floor(Math.random() * amazons.length);
    const item = amazons[randIndex];
    $(".amazon-box").append(`
        <article class="media">
            <div class="media-left">
                <figure class="image is-96x96">
                    <img src="${item.img}"
                        alt="${item.title}"
                        title="${item.title}" />
                </figure>
            </div>
            <div class="media-content">
                <div class="content">
                    <p class="is-size-65">
                        <a href="${item.link}"
                            target="_blank" rel="sponsored noopener">${item.title}</a>
                        <br /><span>${item.org}</span>
                        <br /><span class="is-size-65 subtitle">
                            <a href="${item.link}"
                                target="_blank" rel="sponsored noopener">Amazon</a></span>
                    </p>
                </div>
            </div>
        </article>`);
}

/*
 * ===================================================
 * Google Cloud Storageからの取得処理
 * ===================================================
 */

/**
 * 最近のカレンダーイベント取得
 * @param {*} isInit 
 * @param {*} param 
 * @returns 
 */
async function fetchRecentEvents(isInit, param) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.recent;
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

/**
 * 新規追加されたカレンダーイベントの取得
 * @param {*} isInit 
 * @param {*} param 
 * @returns 
 */
async function fetchNewEvents(isInit, param) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.events;
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

async function fetchOrganizerById(orgId) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.org;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const organizer = datas.find((item) => String(item.orgId || '').toUpperCase() === String(orgId || '').toUpperCase());
            resolve(organizer);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            reject(new Error(`Failed to fetch organizer: ${textStatus}`));
        });
    });
}

async function fetchEventsByOrgId(orgId) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.events;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((event) => String(event.orgId || '').toUpperCase() === String(orgId || '').toUpperCase());
            resolve(filteredDatas);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            reject(new Error(`Failed to fetch events for organizer: ${textStatus}`));
        });
    });
}

/**
 * 最近の動画リスト取得
 * @returns 
 */
async function fetchRecentVideos(num) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.recentVideos;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((event) => {
                return true;
            });
            if (filteredDatas.length > num) {
                resolve(filteredDatas.slice(0, num));
            } else {
                resolve(filteredDatas)
            }
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

/**
 * ポイントランキングページの順位表データを返す
 * @param {String} season シーズンキー。例: 2526, 2627
 * @returns 順位表データ
 */
async function fetchStandings(season = JajaConstants.currentSeason) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.points.getSeasonUrl(season);
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
                reject(new Error(`Failed to fetch standings for season ${season}: ${textStatus}`));
            });
    });
}

/**
 * ポイントランキング 選手別結果一覧取得
 * @param {*} playerId 
 * @returns 
 */
async function fetchPointsDetailByPlayer(playerId) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.points.results;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((record) => {
                if (playerId != "") {
                    return record['player_id'] === playerId;
                } else {
                    return true;
                }
            });
            resolve(filteredDatas);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

/**
 * ポイントランキング 選手情報の取得
 * @param {*} playerId 設定されている場合1件取得 設定無しですべて取得
 * @returns 
 */
async function fetchPlayerDetail(playerId) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.points.players;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((record) => {
                if (playerId != "") {
                    return record['player_id'] === playerId;
                } else {
                    return true;
                }
            });
            resolve(filteredDatas);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

/**
 * ポイントランキング 大会結果の取得
 * @param {*} id 設定されている場合1件取得 設定無しですべて取得
 * @returns 
 */
async function fetchTournaments(eventId) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.points.tournaments;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((record) => {
                if (eventId === "ALL") {
                    return true;
                } else if (eventId != "") {
                    return String(record['event_id'] || '') === String(eventId);
                } else {
                    return true;
                }
            });
            resolve(filteredDatas);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

/**
 * ポイントランキング 大会結果の取得（シリーズIDで絞り込み）
 * @param {*} seriesId シリーズID
 * @returns 
 */
async function fetchTournamentsBySeriesId(seriesId) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.points.tournaments;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((record) => {
                if (seriesId === "ALL") {
                    return true;
                } else if (seriesId != "") {
                    return String(record['series_id'] || '') === String(seriesId);
                } else {
                    return true;
                }
            });
            resolve(filteredDatas);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

/**
 * ポイントランキング 大会結果の取得 イベントIDリストで絞り込み
 * @param {*} id 設定されている場合1件取得 設定無しですべて取得
 * @returns 
 */
async function fetchTournamentsByEventIdList(eventIdList) {
    const publicUrl = JajaConstants.molkkyCalendarStorage.points.tournaments;
    return new Promise((resolve, reject) => {
        $.ajax({
            url: publicUrl,
            type: 'GET',
            dataType: 'json'
        }).done(function (datas) {
            const filteredDatas = datas.filter((record) => {
                // event_idがeventIdListに該当するものにフィルタする
                return eventIdList.includes(record['event_id']);
            });
            resolve(filteredDatas);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`Failed to fetch events: ${textStatus}`));
            });
    });
}

/*
 * ===================================================
 * カレンダーのフィルター関連共通処理
 * ===================================================
 */

/**
 * カテゴリフィルターボタンの初期設定
 */
function initCommonCategoryFilter() {
    appendCategoryFilter();
    categoryFilterEvent();
    applyCategoryFilter();
}

function appendCategoryFilter() {
    const filters = JajaConstants.categoryFilters;
    filters.forEach(filter => {
        $(".jaja-calendar-filter-category").append(`
            <button class="button is-rounded is-light is-small m-1 filter-category filter-category-${filter.key}">
                ${filter.name}</button>
        `);
    });
}

/**
 * カテゴリフィルターボタンのクリックイベント
 */
function categoryFilterEvent() {
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
        localStorage.setItem('categoryFilter', categoryNum);
    });
}

/**
 * カテゴリフィルターの追加
 */
function applyCategoryFilter() {
    // 初期表示時に localStorage の categoryFilter があればそれを適用する
    const storedCategory = localStorage.getItem('categoryFilter');
    if (storedCategory && $(`.filter-category-${storedCategory}`).length) {
        // categoryFilterEventを発火させる
        $(`.filter-category-${storedCategory}`).trigger('click');
    } else {
        resetCommonCategoryFilter();
    }
}

/**
 * カテゴリフィルターのリセット
 */
function resetCommonCategoryFilter() {
    const def = JajaConstants.defaultCalendarFilterParam.category;
    $(`.filter-category-${def}`).addClass('is-primary').removeClass('is-light');
    localStorage.setItem('categoryFilter', def);
    // categoryFilterEventを発火させる
    $(`.filter-category-${def}`).trigger('click');
}

/**
 * 共通日付フィルターの初期化
 */
function initCommonDateFilter() {
    resetCommonDateFilter(false);
    dateChangeEvent();
}

/**
 * 日付変更イベント
 */
function dateChangeEvent() {
    // fromの日付が変更された時のイベントハンドラ
    $('.filter-calendar-from').on('change', async function () {
        const fromDate = new Date($(this).val());
        const diffDays = parseInt(localStorage.getItem('dateFilterDiff')) || 30;

        // diffDays後の日付を計算
        const toDate = new Date(fromDate);
        toDate.setDate(fromDate.getDate() + diffDays);

        // toの日付を更新
        const toDateString = toDate.toISOString().split('T')[0];
        $('.filter-calendar-to').val(toDateString);
        // イベントを再取得
        await updateEvents();
    });
    // toの日付が変更された時のイベントハンドラ
    $('.filter-calendar-to').on('change', async function () {
        const fromDate = new Date($('.filter-calendar-from').val());
        const toDate = new Date($(this).val());
        const diffDays = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
        localStorage.setItem('dateFilterDiff', diffDays.toString());

        await updateEvents();
    });
}

/**
 * 日付フィルターリセット
 * @param {boolean} isForceReset デフォルトの日付差分でリセットする
 */
function resetCommonDateFilter(isForceReset) {
    if (isForceReset) {
        localStorage.setItem('dateFilterDiff', JajaConstants.defaultCalendarFilterParam.dateDiff);
    }
    var dateParam = fetchDefaultDateParam();
    $('.filter-calendar-from').val(dateParam['from']);
    $('.filter-calendar-to').val(dateParam['to']);
    const fromDate = new Date($('.filter-calendar-from').val());
    const toDate = new Date($('.filter-calendar-to').val());
    const diffDays = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
    localStorage.setItem('dateFilterDiff', diffDays.toString());
}

/**
 * 初期表示時の日付フィルター値を取得する
 * @returns 
 */
function fetchDefaultDateParam() {
    var defaultDiff = parseInt(localStorage.getItem('dateFilterDiff'))
        || JajaConstants.defaultCalendarFilterParam.dateDiff;
    if (defaultDiff < 1) {
        localStorage.setItem('dateFilterDiff', JajaConstants.defaultCalendarFilterParam.dateDiff.toString());
        defaultDiff = JajaConstants.defaultCalendarFilterParam.dateDiff;
    }

    const fromDate = new Date();
    var y = fromDate.getFullYear();
    var m = ("00" + (fromDate.getMonth() + 1)).slice(-2);
    var d = ("00" + fromDate.getDate()).slice(-2);
    var calendarFrom = y + "-" + m + "-" + d;

    const toDate = new Date();
    toDate.setDate(toDate.getDate() + defaultDiff);
    y = toDate.getFullYear();
    m = ("00" + (toDate.getMonth() + 1)).slice(-2);
    d = ("00" + toDate.getDate()).slice(-2);
    var calendarTo = y + "-" + m + "-" + d;

    return {
        'from': calendarFrom,
        'to': calendarTo
    };
}

/**
 * 都道府県フィルターの設定
 */
function createCommonAreaFilter() {
    areaOptions = JajaConstants.areaSelects;
    for (i in areaOptions) {
        opt = areaOptions[i];
        $(".filter-area").append($("<option>").val(opt["key"]).text(opt["text"]));
    }
    // ローカルストレージにエリアフィルタ入力履歴がある場合、デフォルト値に設定する
    if (localStorage.getItem('areaFilter')) {
        const areaFilter = localStorage.getItem('areaFilter');
        $(".filter-area").val(areaFilter);
    }
    areaFilterEvent();
}

/**
 * 都道府県フィルター変更イベント
 */
function areaFilterEvent() {
    $('.filter-area').on('change', async function () {
        // ローカルストレージに選択したエリアフィルタを保存
        localStorage.setItem('areaFilter', $(this).val());
        await updateEvents();
    });
}

/**
 * 都道府県フィルターリセット
 */
function resetCommonCalendarAreaFilter() {
    const param = JajaConstants.defaultCalendarFilterParam;
    localStorage.setItem('areaFilter', param.area);
    $(".filter-area").val(param.area);
}

/**
 * 全フィルターリセットイベント
 */
function createCommonCalenderFilterResetEvent() {
    $('.jaja-calendar-filter-reset').on('click', async () => {
        resetCommonCalendarAreaFilter();
        resetCommonDateFilter(true);
        resetCommonCategoryFilter();
        await updateEvents();
    });
}

/*
 * ===================================================
 * ユーティリティー
 * ===================================================
 */

/**
 * 最近作成されたイベントであるか
 * @param {*} event 
 * @param {*} now 
 * @returns 
 */
function isNewCommonEvent(event, now) {
    const registerDateObj = new Date(event['registerDate']);
    return (now - registerDateObj) / (1000 * 60 * 60 * 24) <= 7;
}

/**
 * 最近更新されたイベントであるか
 * @param {*} isNewEvent 
 * @param {*} now 
 * @param {*} updateDateObj 
 * @returns 
 */
function isRecentCommonEvent(isNewEvent, now, updateDateObj) {
    return !isNewEvent && (now - updateDateObj) / (1000 * 60 * 60 * 24) <= 7;
}

/**
 * エリアの設定値が適切か判定する
 * @param {} code 
 * @param {*} name 
 * @returns 
 */
function isEqualsPrefectureCodeAndName(code, name) {
    if (code == '00') {
        return true;
    }
    const normalizedName = normalizePrefectureName(name);
    if (code.slice(0, 1) == 'A') {
        var areaList = JajaConstants.areaList;
        return areaList[code] && areaList[code].includes(normalizedName);
    }
    var prefectureList = JajaConstants.prefectureList;
    return prefectureList[code] == normalizedName;
}

function normalizePrefectureName(name) {
    if (!name) {
        return name;
    }
    return name === 'その他・海外' ? '海外' : name;
}

/**
 * イベントのデータタグを設定する
 * @param {} event 
 * @returns 
 */
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
    if (event['article'] || event['pickupSerial']) {
        tag = tag + ' event-tag-9';
    }
    return tag;
}

/**
 * イベント種類が大会のいずれかであるか
 * @param {*} category 
 * @returns 
 */
function isCompetition(category) {
    return ['大会', '大会（長期）'].includes(category);
}

/**
 * イベント詳細の大会構成を作成する
 * @param {*} composition 
 * @param {*} maxMember 
 * @param {*} minMember 
 * @param {*} rule 
 * @returns 
 */
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
 * Googleカレンダー登録URLを作成する
 * @param {*} eventDate イベント日付
 * @param {*} eventStart イベント開始時間
 * @param {*} eventEnd イベント終了時間
 * @param {*} eventName イベント名
 * @param {*} source イベントソースURL
 * @returns Googleカレンダー登録URL
 */
function createGoogleCalendarLink(eventDate, eventStart, eventEnd, eventName, source) {
    const gCalUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const gCalDetails = '情報取得元: ' + (source) + '\n全国モルックカレンダーにより追加されたイベントです。 詳細は主催者にお問い合わせください。';

    // 指定DateオブジェクトをUTC形式 YYYYMMDDTHHMMSSZ に変換
    function formatUtc(dt) {
        const Y = dt.getUTCFullYear();
        const M = String(dt.getUTCMonth() + 1).padStart(2, '0');
        const D = String(dt.getUTCDate()).padStart(2, '0');
        const h = String(dt.getUTCHours()).padStart(2, '0');
        const m = String(dt.getUTCMinutes()).padStart(2, '0');
        const s = String(dt.getUTCSeconds()).padStart(2, '0');
        return `${Y}${M}${D}T${h}${m}${s}Z`;
    }

    // 日付要素から YYYY,MM,DD をゼロ埋めで取得
    const ed = new Date(eventDate);
    const y = ed.getFullYear();
    const M = String(ed.getMonth() + 1).padStart(2, '0');
    const D = String(ed.getDate()).padStart(2, '0');
    const calendarDate = `${y}${M}${D}`; // YYYYMMDD for all-day

    // 時刻文字列を "HH:MM" 形式に正規化
    function normalizeTime(t) {
        if (!t) return null;
        const parts = String(t).trim().split(':');
        const hh = String(parseInt(parts[0] || 0, 10)).padStart(2, '0');
        const mm = String(parseInt(parts[1] || 0, 10)).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    const startNorm = normalizeTime(eventStart);
    const endNorm = normalizeTime(eventEnd);

    // 時刻がある場合は JST(+09:00) として Date を作り、UTC 表記に変換する（結果として9時間引く処理相当）
    let gCalLink;
    if (startNorm || endNorm) {
        // start がない場合は end を使い、end がない場合は start を使う（双方ないなら到達しない）
        const sTime = startNorm || endNorm;
        const eTime = endNorm || startNorm;

        const startIso = `${y}-${M}-${D}T${sTime}:00+09:00`;
        const endIso = `${y}-${M}-${D}T${eTime}:00+09:00`;

        const startUtc = formatUtc(new Date(startIso));
        const endUtc = formatUtc(new Date(endIso));

        gCalLink = gCalUrl
            + '&text=' + encodeURIComponent(eventName)
            + '&dates=' + startUtc + '/' + endUtc
            + '&details=' + encodeURIComponent(gCalDetails);
    } else {
        // 終日イベント
        gCalLink = gCalUrl
            + '&text=' + encodeURIComponent(eventName)
            + '&dates=' + calendarDate + '/' + calendarDate
            + '&details=' + encodeURIComponent(gCalDetails);
    }
    return gCalLink;
}

// smoothScroll関数をグローバルスコープで定義
window.smoothScroll = function (targetId) {
    const SCROLL_OFFSET = 72;
    const element = document.getElementById(targetId);
    if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
        window.scrollTo({
            top: targetPosition,
            behavior: 'instant'
        });
    }
};

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
