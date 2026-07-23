// 大会詳細ページの初期化処理を実行する
$(async function () {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    await initSettingTournamentPage(params.get('id'));
});

// 指定されたイベントIDに基づいて大会詳細データの読み込みを開始する
async function initSettingTournamentPage(eventId) {
    await fetchTournamentsPageData(eventId);
}

// 大会詳細ページに表示する大会データとシリーズデータを取得する
async function fetchTournamentsPageData(eventId) {
    try {
        const datas = await fetchTournaments(eventId);
        if (datas.length === 0 || datas.length > 1) {
            return;
        }

        const data = datas[0];
        const seriesDatas = data.series_id ? await fetchTournamentsBySeriesId(data.series_id) : [];
        appendTournamentResult(data, seriesDatas);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// 取得した大会データをベース情報と順位結果に分けて描画する
function appendTournamentResult(data, seriesDatas = []) {
    appendTournamentResultBaseInfo(data, seriesDatas);
    appendTournamentResultRow(data);
}

// 大会の基本情報・画像・SNS・VOD・シリーズ一覧をページへ追加する
function appendTournamentResultBaseInfo(data, seriesDatas = []) {
    // 大会情報の追加
    const info = {
        seq: data.seq,
        event_id: data.event_id,
        event_name: data.event_name,
        event_date: data.event_date,
        org: data.org,
        prefecture: data.prefecture,
        play_category: data.play_category,
        player_num: data.player_num,
        event_size_tier: data.event_size_tier,
        point_tier: data.point_tier,
        result_sheet: data.result_sheet,
        result_img: data.result_img,
        result_sns: data.result_sns,
        vod_url: data.vod_url,
        team_size: data.team_size,
        season: data.season,
        series_name: data.series_name,
        series_id: data.series_id,
    };
    const eventTeamRule = info.play_category == "個人戦" ?
        "個人" : "チーム (" + info.team_size + ")";
    const teamTagClass = eventTeamRule == "個人" ? "is-link has-text-weight-bold" : "is-success has-text-weight-bold";
    const pointTier = info.point_tier + " Tier";
    const pointTierClass = (function (pt) {
        switch ((pt || '').toString().toUpperCase()) {
            case 'S': return 'is-danger';
            case 'A': return 'is-primary';
            case 'B': return 'is-success';
            case 'C': return 'has-background-grey';
            default: return 'has-background-grey';
        }
    })(info.point_tier);

    const partNum = info.play_category == "個人戦" ?
        info.player_num + "名" : info.player_num + "チーム";
    const resultSheet = info.result_sheet != "" ?
        `<p class="is-size-65">
            <a href="${info.result_sheet}"
                target="_blank">すべての結果を見る（別サイトを開きます）</a>
        </p>` : "";
    const seriesDisplay = info.series_name || info.series_id || "未設定";
    const seriesInfo = info.series_id ?
        `<span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">シリーズ</span>${seriesDisplay}<br/>` : "";

    $("#tounament-info").append(`
        <div class="content jaja-points-tournament-info">
            <p class="is-size-7 mb-1">※Tierは最大ポイントから機械的に決定しています</p>
            <p class="tags jaja-tags has-addons py-0 mb-2">
                <span class="tag narrow ${teamTagClass}"><span class="has-text-light">${eventTeamRule}</span></span>
                <span class="tag narrow is-light">${info.prefecture}</span>
                <span class="tag narrow ${pointTierClass}"><span class="is-size-7 has-text-light has-text-weight-bold">
                    ${pointTier}</span></span>
            </p>
            <p class="is-size-5 has-text-weight-bold mb-1">${info.event_name}</p>
            <p class="subtitle is-size-65 has-text-grey">
                <i class="las la-user"></i>${info.org}<br />
                <i class="las la-calendar"></i>${new Date(info.event_date).toLocaleDateString()}
            </p>
            <p class="is-size-65">
                <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">シーズン</span>${info.season}<br/>
                <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">${eventTeamRule}</span><br/>
                <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">参加</span>${partNum}<br/>
                ${seriesInfo}
            ${resultSheet}
        </div>
    `);
    // 画像（表彰写真など）の追加
    if (info.result_img != "") {
        $(".section.jaja-calendar-points-tournament-remarks").append(`
            <div class="content">
                <div class="card">
                    <div class="card-image">
                        <figure class="image">
                            <img src="${info.result_img}" />
                        </figure>
                    </div>
                </div>
            </div>
        `);
    }
    // SNS投稿リンクの追加
    if (info.result_sns != "") {
        $(".section.jaja-calendar-points-tournament-remarks").append(`
            <div class="content">
                <a href="${info.result_sns}" target="_blank" class="is-size-65">SNSの投稿をみる（外部サイト）</a>
            </div>
        `);
    }
    // VODの追加
    const vodUrls = splitVodUrls(info.vod_url);
    if (vodUrls.length > 0) {
        const vodHtml = vodUrls.map(vodUrl => {
            const embedUrl = getYoutubeEmbedUrl(vodUrl);
            return `
                <div class="content">
                    <div class="container">
                        <figure class="image is-16by9">
                            <iframe class="has-ratio" width="640" height="360" src="${embedUrl}" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        </figure>
                    </div>
                </div>
            `;
        }).join('');

        $(".section.jaja-calendar-points-tournament-remarks").append(vodHtml);
    }

    const otherSeriesTournaments = (seriesDatas || [])
        .sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    if (otherSeriesTournaments.length > 0) {
        const seriesListItems = otherSeriesTournaments.map(item => {
            const label = item.event_name || item.event_id || '大会';
            const eventDate = item.event_date ? new Date(item.event_date).toLocaleDateString() : '';
            return `<li class="mb-1"><span class="tag is-light is-small ml-2 has-text-weight-bold">${eventDate}</span>
                <a href="../tournament?id=${item.event_id}" class="is-size-65">${label}</a></li>`;
        }).join('');

        $(".section.jaja-calendar-points-tournament-remarks").append(`
            <div class="content">
                <p class="is-size-6 has-text-weight-bold mb-2">シリーズ: ${seriesDisplay}</p>
                <ul style="list-style: none; padding-left: 0; margin: 0;">
                    ${seriesListItems}
                </ul>
            </div>
        `);
    }
}

// VODのURL文字列を半角カンマ区切りで分割する
function splitVodUrls(vodUrlValue) {
    if (!vodUrlValue) {
        return [];
    }

    return String(vodUrlValue)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

// YouTube URLを埋め込み用のURLに変換する
function getYoutubeEmbedUrl(url) {
    if (!url) {
        return '';
    }

    const trimmedUrl = String(url).trim();
    if (!trimmedUrl) {
        return '';
    }

    const youtubeIdPattern = /([A-Za-z0-9_-]{11})/;
    const directMatch = trimmedUrl.match(youtubeIdPattern);

    try {
        const parsedUrl = new URL(trimmedUrl);
        const host = parsedUrl.hostname.replace(/^www\./, '');
        const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

        if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'www.youtube.com') {
            const searchParams = parsedUrl.searchParams;
            const videoIdFromQuery = searchParams.get('v');
            if (videoIdFromQuery) {
                return `https://www.youtube.com/embed/${videoIdFromQuery}`;
            }

            if (pathSegments.length > 0) {
                const lastSegment = pathSegments[pathSegments.length - 1];
                if (lastSegment && youtubeIdPattern.test(lastSegment)) {
                    return `https://www.youtube.com/embed/${lastSegment}`;
                }
            }
        }

        if (host === 'youtu.be') {
            const lastSegment = pathSegments[pathSegments.length - 1];
            if (lastSegment && youtubeIdPattern.test(lastSegment)) {
                return `https://www.youtube.com/embed/${lastSegment}`;
            }
        }

        if (host === 'i.ytimg.com' || host === 'img.youtube.com' || host === 'ytimg.com') {
            const videoIdFromPath = pathSegments.find((segment, index) => {
                if (segment === 'an_webp' || segment === 'vi') {
                    return pathSegments[index + 1] && youtubeIdPattern.test(pathSegments[index + 1]);
                }
                return false;
            });
            if (videoIdFromPath) {
                const idIndex = pathSegments.indexOf(videoIdFromPath);
                const candidate = pathSegments[idIndex + 1];
                if (candidate && youtubeIdPattern.test(candidate)) {
                    return `https://www.youtube.com/embed/${candidate}`;
                }
            }

            const lastSegment = pathSegments[pathSegments.length - 1];
            if (lastSegment && youtubeIdPattern.test(lastSegment)) {
                return `https://www.youtube.com/embed/${lastSegment}`;
            }
        }
    } catch (error) {
        // URLとして解釈できない場合は、文字列中に含まれる YouTube ID らしきものを探す
    }

    if (directMatch) {
        return `https://www.youtube.com/embed/${directMatch[1]}`;
    }

    return trimmedUrl;
}

// 大会結果の順位表を作成してページへ追加する
function appendTournamentResultRow(data) {
    // 1～16位の結果を配列にマップ化
    const results = [];
    for (let position = 1; position <= 16; position++) {
        const result = {
            position: position,
            point: data[`position_${position}_point`] || 0,
            pid: data[`position_${position}_pid`] || '',
            pname: data[`position_${position}_pname`] || '',
            pas: data[`position_${position}_pas`] || '',
            pother: data[`position_${position}_pother`] || ''
        };
        results.push(result);
    }
    for (const i in results) {
        const res = results[i];
        const isNone = res.pother === "(NONE)";

        const splitByComma = (s) => {
            if (s == null) return [];
            const str = String(s).trim();
            if (str === '') return [];
            return str.split(',').map(v => v.trim());
        };

        const pidList = splitByComma(res.pid);
        const pnameList = splitByComma(res.pname);
        const pasList = splitByComma(res.pas);

        const resd = [];
        for (let i = 0; i < pidList.length; i++) {
            const innerRes = {
                pid: pidList[i],
                pname: pnameList[i],
                pas: pasList[i],
            }
            resd.push(innerRes);
        }
        // その順位に申請があるか
        const isApply = resd.length > 0;
        // その順位にシステム外結果があるか
        const isExistOther = res.pother !== '';

        // 順位
        const dispPpsition = isNone || !isApply ?
            `<span class="has-text-grey-light">${res.position}</span>` :
            `<span class="has-text-danger">${res.position}</span>`;
        // 選手・チーム名の表示
        var dispName = "";
        if (!isApply && !isExistOther) {
            dispName = `<span class="has-text-grey-light">（未登録）</span>`;
        } else if (isApply) {
            dispName = resd.map(
                r => `<a href="../player?pid=${r.pid}"><span>${r.pname}</span>
                    <i class="las la-tshirt ml-1 has-text-grey is-size-6"></i>
                    <span class="has-text-grey-light is-size-7">${r.pas}</span></a><br/>`
            ).join('')
        }
        dispName += isExistOther ?
            `<span class="has-text-grey-light">
                <i class="las la-ghost mr-1 is-size-6"></i>${res.pother}</span>` : "";
        // ポイント表示
        const dispPoint = isApply
            ? `<span class="has-text-danger">${res.point}</span>`
            : `<span class="has-text-grey-light">${res.point}</span>`;

        // 順位を追加
        const noneStr = `<span class="has-text-grey-light">-</span>`;
        $("#tournament-result-content").append(`
            <tr>
                <td class="has-text-right has-text-weight-bold is-middle">
                    ${dispPpsition}
                </td>
                <td>
                    ${isNone ? noneStr : dispName}
                </td>
                <td class="is-middle has-text-right has-text-weight-bold">
                    ${isNone ? noneStr : dispPoint}
                </td>
            </tr>
        `);
    }
}

