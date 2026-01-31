$(async function () {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    await initSettingTournamentPage(params.get('id'));
});

async function initSettingTournamentPage(eventId) {
    await fetchTournamentsPageData(eventId);
}

async function fetchTournamentsPageData(eventId) {
    try {
        const datas = await fetchTournaments(eventId);
        appendTournamentResult(datas);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function appendTournamentResult(datas) {
    if (datas.length === 0 || datas.length > 1) {
        return;
    }
    const data = datas[0];
    appendTournamentResultBaseInfo(data);
    appendTournamentResultRow(data);
}

function appendTournamentResultBaseInfo(data) {
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
                <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">参加</span>${partNum}
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
}

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

