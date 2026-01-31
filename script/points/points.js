$(async function () {
    await initSetting();
    initPlayerDetailEvent();
    initRecentPoinsMoreEvent();
});

async function initSetting() {
    await fetchPointsPageStandings();
    await fetchRecentPoints();
    fetchAnnounce();
}

async function fetchPointsPageStandings() {
    try {
        const datas = await fetchStandings();
        appendStandings(datas);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

async function fetchRecentPoints() {
    const datas = await fetchPointsDetailByPlayer("");
    appendRecentPoints(datas);
}

function fetchAnnounce() {
    const announceList = getAnnounceList();
    const now = new Date();
    announceList.sort((a, b) => a.date - b.date);
    for (const an of announceList) {
        $("#announce-list").append(`
            <li>
                <span class="has-text-weight-semibold is-size-65">(${an.date.toLocaleDateString()}) ${an.title}</span>
                <p>
                    <span class="is-size-7">${an.msg}</span>
                </p>
            </li>
        `)
    }
}

/**
 * player-recordクリックイベント
 */
async function initPlayerDetailEvent() {
    return;
    $('.player-record').click(async function () {
        const playerId = $(this).data('player-id');
        $("#player-detail").show();
        if (playerId) {
            const pointsDatas = await fetchPointsDetailByPlayer(playerId);
            const playerDatas = await fetchPlayerDetail(playerId);
            appendPlayerDetail(playerId, pointsDatas, playerDatas[0]);
        }
    });
}

/**
 * 最近のポイント もっとみる ボタンのクリックイベント
 */
function initRecentPoinsMoreEvent() {
    $('#recent-points-more').click(function () {
        // 次の10件を表示
        const visibleItems = $('#recent-points-list li:visible').length;
        $('#recent-points-list li').slice(visibleItems, visibleItems + 10).removeClass('jaja-display-none');

        // すべて表示された場合はボタンを非表示
        if ($('#recent-points-list li:visible').length >= $('#recent-points-list li').length) {
            $(this).hide();
        }
    });
}

function appendRecentPoints(datas) {
    datas.sort((a, b) => new Date(b['create']) - new Date(a['create']) || b['seq'] - a['seq']);
    for (const i in datas) {
        if (i >= 100) {
            break;
        }
        const rec = datas[i];
        const pName = `<a href="./player?pid=${rec.player_id}">
            <span class="has-text-weight-semibold">
            ${rec.player_name}</span></a>`
        const eName = `<a href="./tournament?id=${rec.event_id}"><span class="has-text-weight-semibold">${rec.event_name}</span></a>`
        const rankPoint = `<span class="has-text-primary-50 has-text-weight-semibold">${rec.rank}位 ${rec.points}P</span>`
        $("#recent-points-list").append(`
            <li class="is-size-7 mb-2 ${i >= 10 ? "jaja-display-none" : ""}">${pName} が ${eName} で ${rankPoint}を獲得！
            </li>
        `);
    }
    $("#recent-points").append(`<button id="recent-points-more" class="button is-fullwidth is-size-7 is-outlined is-danger">
        もっとみる<i class="las la-angle-down ml-1 has-text-primary"></i></button>`);
}

/**
 * 現在使用していないメソッド（選手詳細表示）
 * @param {*} playerId 
 * @param {*} pointsDatas 
 * @param {*} player 
 */
function appendPlayerDetail(playerId, pointsDatas, player) {
    pointsDatas.sort((a, b) => new Date(b['event_date']) - new Date(a['event_date']));

    // 既に表示されている場合は中身を空にする
    $('#player-detail-content').empty();
    // タップしたセルの背景色を変更
    $('.player-record').removeClass('has-background-danger-90');
    const pidClass = `.player-record[data-player-id='${playerId}']`;
    $(pidClass).addClass('has-background-danger-90');

    // タップしたtrタグのdata-player-name属性から選手名を取得
    const playerName = player.player_name;
    const playerTeamTag = createTeamTag(
        player.team_tag_1, player.team_tag_2, player.team_tag_3, player.team_tag_4
    );
    const area = player.area;
    var playerPoints = player.s2526_points;
    var rank = parseInt(player.s2526_rank).toString();
    const suffix =
        rank.slice(-1) === "1" ? "st" :
            rank.slice(-1) === "2" ? "nd" :
                rank.slice(-1) === "3" ? "rd" : "th";
    rank += suffix;

    const xAccount = createXLink(player.x_account);
    const instagram = createInstagramLink(player.instagram_account);
    const tiktok = createTiktokLink(player.tiktok_account);
    const youtube = createYoutubeLink(player.youtube_account);
    const otherLink = createOtherLink(player.other_sns);
    const links = `<span class="is-size-5 is-pulled-right">${xAccount}${instagram}${tiktok}${youtube}${otherLink}</span>`;
    const areaTag = area != "" ? `<span class="tag narrow has-text-weight-bold p-1 mr-2">${area}</span>` : "";
    const teamTag = playerTeamTag != "" ?
        `<br/><span class="has-text-grey"><i class="las la-tags mr-1"></i>${playerTeamTag}</span>` : "";
    const playerDispName = playerName.split('｜').map((name, index) => {
        return index === 0 ?
            name :
            `<span class="has-text-white-ter is-size-6">${name}</span>`;
    }).join('<span class="has-text-white-ter is-size-6">｜</span>');

    // トロフィー、メダルアイコン
    var trophyNum = 0;
    var medalNum = 0;

    var results = "";
    for (const record of pointsDatas) {


        // 最近のイベントかの判定
        const now = new Date();
        const updateDateObj = new Date(record['event_date']);
        const isUpdated = isRecentPlayer(now, updateDateObj);
        const updateIcon = isUpdated ? `<i class="las la-angle-double-up has-text-info ml-2 is-size-6"></i> ` : "";

        // （個人戦orチーム戦）（開催地）大会日付・大会名
        const eventTeamRule = record['event_team_rule'] == "個人戦" ?
            "個人" : "チーム (" + record['event_team_num'] + ")";
        const teamTagClass = eventTeamRule == "個人" ? "is-link has-text-weight-bold" : "is-success has-text-weight-bold";
        // エリア
        const eventArea = record['event_area'] != "" ? record['event_area'] : "";
        // 大会日付（日付型をyyyy/m/d形式に変換）
        const eventDate = record['event_date'] != "" ?
            `<span class="is-size-7">${new Date(record['event_date']).toLocaleDateString()}</span>` : "";
        // 大会名
        const eventName = record['event_name'] != "" ?
            `<span class="is-size-65 has-text-weight-semibold">${record['event_name']}</span>` : "";
        // エントリー名
        const entryName = record['entry_team_name'] != "" ?
            `<i class="las la-tshirt mr-1 has-text-grey"></i><span class="is-size-7 subtitle">${record['entry_team_name']}</span>` : "";
        const cateTag = `
            <p class="tags jaja-tags has-addons py-0 mb-1">
                <span class="tag narrow ${teamTagClass}"><span class="has-text-light">${eventTeamRule}</span></span>
                <span class="tag narrow is-light">${eventArea}</span>
                <span class="tag narrow is-dark">${eventDate} ${updateIcon}</span>
            </p>`;
        // 順位/参加数
        const rankClass = record['rank'] == 1 ? "has-text-danger-on-scheme has-text-weight-bold"
            : record['rank'] == 2 ? "has-text-link-on-scheme has-text-weight-bold"
                : record['rank'] == 3 ? "has-text-success-on-scheme has-text-weight-bold" : "";
        const eventRank = record['rank'] != "" ?
            `<span class="is-size-6 ${rankClass}">${record['rank']}位</span><span class="is-size-7"> / ${record['entry_num']}</span>` : "";
        if (record['rank'] === 1) {
            trophyNum++;
        } else if (record['rank'] === 2 || record['rank'] === 3) {
            medalNum++;
        }
        // ポイント
        const eventPoints = record['points'] != "" ?
            `<span class="has-text-weight-bold ${rankClass}">(${record['points']})</span>` : "";

        results += `
            <tr class="is-size-65">
                <td class="py-2 px-1">
                    ${cateTag}
                    <a href="./tournament?id=${record['event_id']}">${eventName}</a><br/>
                    ${entryName}
                </td>
                <td class="has-text-right is-middle py-2 px-1">
                    ${eventRank}
                    ${eventPoints}
                </td>
            </tr>
        `;
    }

    // trophyNumの数だけトロフィーアイコン、medalNumの数だけメダルアイコンを追加する
    const trophyIcons = Array(trophyNum).fill('<i class="las la-trophy has-text-danger is-size-6 ml-1"></i>').join('');
    const medalIcons = Array(medalNum).fill('<i class="las la-medal has-text-success is-size-6 ml-1"></i>').join('');

    $("#player-detail-content").append(`
        <div class="card mb-3">
            <header class="card-header has-background-danger">
                <p class="card-header-title is-size-5 has-text-light">
                    <a href="./player?pid=${playerId}"><u>${playerDispName}</u></a>
                </p>
                <p class="pt-3 mx-2">
                    <span class="is-size-5 has-text-weight-bold has-text-light">${rank}</span><br/>
                    <span class="is-size-65 has-text-light">(${playerPoints} Pts)</span>
                </p>
            </header>
            <div class="card-content p-3">
                <div class="content">
                    <p class="card-header-subtitle is-size-7 is-middle">
                        ${areaTag}${trophyIcons}${medalIcons}${links}
                        ${teamTag}
                        <br/><i class="las la-id-card mr-1 has-text-grey"></i><span class="has-text-grey">${playerId}</span>
                    </p>
                    <table class="table is-fullwidth">
                        <thead>
                            <tr class="is-size-65">
                                <th class="is-middle">大会
                                    <span class="has-text-danger has-text-fontweight-bold is-size-7 ml-2">タップで詳細ページへ</bold></th>
                                <th class="has-text-right is-middle is-size-7">位(Pts)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results}
                        </tbody>
                    </table>
                    <p class="pt-3 mx-2 is-size-5"></p>
                </div>
            </div>
        </div>
    `);


    // 選手詳細エリアまでスクロール
    const detailTop = $('#player-detail').offset().top;
    $('html, body').animate({ scrollTop: detailTop }, 'fast');
}

function appendStandings(datas) {
    var rank = 1;
    var tienum = 0;
    const maxItems = 100;


    for (const i in datas) {
        if (i >= maxItems) {
            break;
        }
        const record = datas[i];

        // 順位計算
        if (i == 0) {
            rank = 1;
            tienum = 0;
        } else if (record['points'] < datas[i - 1]['points']) {
            rank++;
            if (tienum > 0) {
                rank += tienum;
                tienum = 0;
            }
        } else if (record['points'] == datas[i - 1]['points']) {
            tienum++;
        }

        // 新規・最近のイベントかの判定
        const now = new Date();
        const updateDateObj = new Date(record['update_date']);
        const isNew = isNewPlayer(record, now);
        const isUpdated = isRecentPlayer(now, updateDateObj);
        const newPlayerIcon = isNew ? `<i class="las la-leaf has-text-success"></i> ` : "";
        const updateIcon = isUpdated ? `<i class="las la-angle-double-up has-text-info"></i> ` : "";

        const playerDispName = record['player_name'].split('｜').map((name, index) => {
            return index === 0 ?
                name :
                `<span class="has-text-grey is-size-65">${name}</span>`;
        }).join('<span class="has-text-grey is-size-65">｜</span>');
        const area = record['area'] != "" ? `<span class="tag narrow has-text-weight-bold p-1">${record['area']}</span>` : "";
        const teamTag = createTeamTag(record['team_tag_1'], record['team_tag_2'], record['team_tag_3'], record['team_tag_4']);

        const xAccount = createXLink(record['x_account']);
        const instagram = createInstagramLink(record['instagram_account']);
        const tiktok = createTiktokLink(record['tiktok_account']);
        const youtube = createYoutubeLink(record['youtube_account']);
        const otherLink = createOtherLink(record['other_sns']);
        const links = `<span class="is-size-6">${xAccount}${instagram}${tiktok}${youtube}${otherLink}</span>`;

        const playerData = `
                data-player-id="${record['player_id']}"
            `;

        // イベントカード要素の追加
        $('#standings-content tbody').append(
            `<tr class="player-record" ${playerData}>
                <td class="has-text-right has-text-weight-bold is-middle has-text-danger">${rank}</td>
                <td>
                    <p class="is-size-6 player-name-tag my-1">
                        ${newPlayerIcon}${updateIcon}
                        <a href="./player?pid=${record['player_id']}">
                            <span class="has-text-weight-bold has-text-link">${playerDispName}</span></a>
                        ${links}
                    </p>
                    <p class="is-size-6 my-1">
                        ${area} <span class="is-size-7 has-text-grey"><i class="las la-tags mr-1"></i>${teamTag}</span></td>
                    </p>
                <td class="is-middle has-text-right has-text-weight-bold">${record['points']}</td>
                <td class="is-middle has-text-right">${record['rankin_count']}</td>
            </tr>`
        );
    }
}

function createTeamTag(tag1, tag2, tag3, tag4) {
    return [tag1, tag2, tag3, tag4]
        .filter(Boolean).join('｜');
}

function createXLink(account) {
    return account != "" ?
        ` <a class="has-text-danger" href="https://x.com/${account}" target="_blank">
                        <i class="lab la-twitter"></i></a>` : '';
}

function createInstagramLink(account) {
    return account != "" ?
        ` <a class="has-text-danger" href="https://www.instagram.com/${account}" target="_blank">
                        <i class="lab la-instagram"></i></a>` : '';
}

function createTiktokLink(account) {
    return account != "" ?
        ` <a class="has-text-danger" href="https://www.tiktok.com/@${account}" target="_blank">
                        Ti</a>` : '';
}

function createYoutubeLink(account) {
    return account != "" ?
        ` <a class="has-text-danger" href="https://www.youtube.com/@${account}" target="_blank">
                        <i class="lab la-youtube"></i></a>` : '';
}

function createOtherLink(url) {
    return url != "" ?
        ` <a class="has-text-danger" href="${url}" target="_blank">
                        <i class="las la-link"></i></a>` : '';
}

function isNewPlayer(record, now) {
    const registerDateObj = new Date(record['create_date']);
    return (now - registerDateObj) / (1000 * 60 * 60 * 24) <= 7;
}

function isRecentPlayer(now, updateDateObj) {
    return (now - updateDateObj) / (1000 * 60 * 60 * 24) <= 7;
}

function getAnnounceList() {
    return [
        {
            date: new Date("2025-12-17"),
            title: "日本モルック選手権関連大会をポイント対象とします",
            msg: "日本モルック選手権2026の関連大会（地方予選・本戦）は本来申請対象外ですが、注目度が高く多くの参加が予想されるため、特別に申請可能な大会とするので、いつも通りフォームから申請してください。"
        },
        {
            date: new Date("2025-12-25"),
            title: "ポイント申請条件の変更",
            msg: "申請者がその大会の主催・運営を担当している場合は、ポイント申請は不可とします。2025/12/25までに申請が承認されたポイントをさかのぼって取り下げることはありません。"
        },
    ];
}
