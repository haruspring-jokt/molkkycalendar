$(document).ready(async function () {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    await initSettingPlayerPage(params.get('pid'));
});

/**
 * 選手ページの初期設定
 * @param {String} playerId 
 */
async function initSettingPlayerPage(playerId) {
    await fetchPlayerPageData(playerId);
}

/**
 * 選手ページのデータ取得、描画
* @param {String} playerId 選手ID
 */
async function fetchPlayerPageData(playerId) {
    try {
        const playerInfo = await fetchPlayerDetail(playerId);
        appendPlayerInfo(playerInfo);
        const pointsDetail = await fetchPointsDetailByPlayer(playerId);
        const eventIdList = playerInfo[0].events.split(',');
        const tournaments = await fetchTournamentsByEventIdList(eventIdList);
        appendPointsDetail(pointsDetail, tournaments);
    } catch (error) {
        console.error(error);
    }
}

/**
 * 選手ページ 選手情報の設定
 * @param {*} datas 選手情報JSON
 */
function appendPlayerInfo(datas) {
    if (datas.length === 0 || datas.length > 1) {
        return;
    }
    const data = datas[0];
    const playerDispName = data.player_name_aka ?
        `${data.player_name} ｜<span class="has-text-grey is-size-6">${data.player_name_aka}</span>`
        : data.player_name;
    // team_tag_1から4を、で結合（空文字でない場合）
    const teamTags = [data.team_tag_1, data.team_tag_2, data.team_tag_3, data.team_tag_4]
        .filter(tag => tag && tag.trim() !== '')
        .join('、');
    const events = data.events.split(',');

    const xAccount = createXLink(data.x_account);
    const instagram = createInstagramLink(data.instagram_account);
    const tiktok = createTiktokLink(data.tiktok_account);
    const youtube = createYoutubeLink(data.youtube_account);
    const otherLink = createOtherLink(data.other_sns);
    const links = `<span class="is-size-5">${xAccount}${instagram}${tiktok}${youtube}${otherLink}</span>`;

    $("#player-info").append(`
        <h3 class="title is-size-5 mb-1">${playerDispName}</h3>
        <span>${links}</span><br/>
        <span id="player-achivement"></span>
        <p class="subtitle is-size-65 has-text-grey">
            <i class="lab las la-tags"></i>${teamTags} <br />
            <i class="las la-calendar"></i>${new Date(data.create).toLocaleDateString()} 登録 <br />
            <i class="las la-id-card mr-1 has-text-grey"></i>${data.player_id}
        </p>
        <p class="is-size-65">
            <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">通算ポイント</span>${data.s2526_points}<br/>
            <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">25-26シーズン</span>${data.s2526_points}<br/>
            <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">シーズン順位</span>${data.s2526_rank}<br/>
            <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">シーズン入賞回数</span>${events.length}<br/>
            <span class="tag narrow has-text-weight-bold p-1 mr-1 mb-2">エリア</span>${data.area}<br/>
        </p>
    `);
}

/**
 * 選手情報ページ 入賞履歴の設定
 * @param {*} datas 入賞履歴JSON
 * @param {*} tournaments 入賞した大会情報一覧JSON
 */
function appendPointsDetail(datas, tournaments) {
    if (datas.length === 0) {
        return;
    }
    datas.sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        return dateB - dateA;
    });
    for (const i in datas) {
        const data = datas[i];
        // data.event_idに一致するtournamentsのレコードを取得する
        const tournament = tournaments.find(t => t.event_id === data.event_id);
        console.log(tournament);

        const eventDate = new Date(data.event_date).toLocaleDateString();
        const rankStr = (function (rank) {
            switch ((rank || '').toString()) {
                case '1': return `<span class="is-size-65 is-pulled-right has-text-danger has-text-weight-bold">${rank} (${data.points})</span>`;
                case '2': return `<span class="is-size-65 is-pulled-right has-text-primary has-text-weight-bold">${rank} (${data.points})</span>`;
                case '3': return `<span class="is-size-65 is-pulled-right has-text-primary has-text-weight-bold">${rank} (${data.points})</span>`;
                default: return `<span class="is-size-65 is-pulled-right">${rank} (${data.points})</span>`;
            }
        })(data.rank);
        const pointTierClass = (function (pt) {
            switch ((pt || '').toString().toUpperCase()) {
                case 'S': return 'is-danger';
                case 'A': return 'is-primary';
                case 'B': return 'is-success';
                case 'C': return 'has-background-grey';
                default: return 'has-background-grey';
            }
        })(tournament.point_tier);
        const eventTeamRule = data.event_team_rule == "個人戦" ?
            "個人" : "T (" + data.event_team_num + ")";
        const teamTagClass = eventTeamRule == "個人" ? "is-link has-text-weight-bold" : "is-success has-text-weight-bold";
        const prefecture = data.event_area === "その他・海外"
            ? "海外"
            : data.event_area;

        $("#player-result-content").append(`
            <tr>
                <td class="is-middle py-2">
                    <p class="tags jaja-tags has-addons py-0 mb-0">
                        <span class="tag narrow ${teamTagClass}"><span class="has-text-light">${eventTeamRule}</span></span>
                        <span class="tag narrow is-light">${prefecture}</span>
                        <span class="tag narrow ${pointTierClass}"><span class="is-size-7 has-text-light has-text-weight-bold">
                            ${tournament.point_tier} <i class="las la-user"></i>${data.entry_num}</span></span>
                    </p>
                    <a href="../tournament?id=${data.event_id}"><span class="is-size-7">${data.event_name}</span></a><br/>
                    <span class="has-text-grey is-size-7"><i class="las la-tshirt mr-1"></i>${data.entry_team_name}</span>
                </td>
                <td class="is-middle">
                    <span class="is-size-7">${eventDate}</span>
                </td>    
                <td class="is-middle">
                    <span class="is-size-65 is-pulled-right">${rankStr}</span>
                </td>
            </tr>
        `);
    }

    // トロフィー、メダルアイコンの追加
    let trophy = 0;
    let medal = 0;
    for (const i in datas) {
        const data = datas[i];
        if (data.rank === 1) {
            trophy++;
        } else if (data.rank === 2 || data.rank === 3) {
            medal++;
        }
    }
    const trophyIcons = Array(trophy).fill('<i class="las la-trophy has-text-danger is-size-6"></i>').join('');
    const medalIcons = Array(medal).fill('<i class="las la-medal has-text-success is-size-6"></i>').join('');
    $("#player-achivement").append(`
        ${trophyIcons}${medalIcons}
    `)
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
