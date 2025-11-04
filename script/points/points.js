$(async function () {
    await initSetting();
    initPlayerDetailEvent();
});

async function initSetting() {
    await fetchPointsPageStandings();
}

async function fetchPointsPageStandings() {
    try {
        const datas = await fetchStandings();
        appendStandings(datas);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

/**
 * player-recordクリックイベント
 */
async function initPlayerDetailEvent() {
    $('.player-record').click(async function () {
        const playerId = $(this).data('player-id');
        if (playerId) {
            const datas = await fetchPlayerDetail(playerId);
            appendPlayerDetail(datas, playerId);
        }
    });
}

function appendPlayerDetail(datas, playerId) {
    datas.sort((a, b) => new Date(b['event_date']) - new Date(a['event_date']));

    // 既に表示されている場合は中身を空にする
    $('#player-detail-content').empty();
    // タップしたセルの背景色を変更
    $('.player-record').removeClass('has-background-danger-90');
    $(`.player-record[data-player-id='${playerId}']`).addClass('has-background-danger-90');

    // タップしたtrタグのdata-player-name属性から選手名を取得
    const playerName = $(`.player-record[data-player-id='${playerId}']`).data('player-name');
    const playerTeamTag = $(`.player-record[data-player-id='${playerId}']`).data('player-team-tag');
    const playerX = $(`.player-record[data-player-id='${playerId}']`).data('player-x');
    const playerInstagram = $(`.player-record[data-player-id='${playerId}']`).data('player-instagram');
    const playerTiktok = $(`.player-record[data-player-id='${playerId}']`).data('player-tiktok');
    const playerYoutube = $(`.player-record[data-player-id='${playerId}']`).data('player-youtube');
    const playerOther = $(`.player-record[data-player-id='${playerId}']`).data('player-other');
    const playerPoints = $(`.player-record[data-player-id='${playerId}']`).data('player-points');
    var rank = $(`.player-record[data-player-id='${playerId}']`).data('player-rank').toString();
    if (rank.slice(-1) === "1") {
        rank += "st";
    } else if (rank.slice(-1) === "2") {
        rank += "nd";
    } else if (rank.slice(-1) === "3") {
        rank += "rd";
    } else {
        rank += "th";
    }
    const area = $(`.player-record[data-player-id='${playerId}']`).data('player-area');

    const xAccount = createXLink(playerX);
    const instagram = createInstagramLink(playerInstagram);
    const tiktok = createTiktokLink(playerTiktok);
    const youtube = createYoutubeLink(playerYoutube);
    const otherLink = createOtherLink(playerOther);
    const links = `<span class="is-size-5 is-pulled-right">${xAccount}${instagram}${tiktok}${youtube}${otherLink}</span>`;
    const areaTag = area != "" ? `<span class="tag has-text-weight-bold p-1 mr-2">${area}</span>` : "";
    const teamTag = playerTeamTag != "" ? `<br/><span class="has-text-grey"><i class="las la-tags mr-1"></i>${playerTeamTag}</span>` : "";
    const playerDispName = playerName.split('｜').map((name, index) => {
        return index === 0 ?
            name :
            `<span class="has-text-white-ter is-size-6">${name}</span>`;
    }).join('<span class="has-text-white-ter is-size-6">｜</span>');

    // トロフィー、メダルアイコン
    var trophyNum = 0;
    var medalNum = 0;

    var results = "";
    for (const record of datas) {
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
                <p class="tags has-addons py-0 mb-1">
                    <span class="tag ${teamTagClass}"><span class="has-text-light">${eventTeamRule}</span></span>
                    <span class="tag is-light">${eventArea}</span>
                    <span class="tag is-dark">${eventDate} ${updateIcon}</span>
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
                    ${eventName}<br/>
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
                <p class="card-header-title is-size-5 has-text-light">${playerDispName}</p>
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
                                <th class="is-middle">大会</th>
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
        const area = record['area'] != "" ? `<span class="tag has-text-weight-bold p-1">${record['area']}</span>` : "";
        // team_tag_1からteam_tag_4を配列にして、存在するものだけパイプでつなぐ
        const teamTag = [record['team_tag_1'], record['team_tag_2'], record['team_tag_3'], record['team_tag_4']]
            .filter(Boolean).join('｜');

        const xAccount = createXLink(record['x_account']);
        const instagram = createInstagramLink(record['instagram_account']);
        const tiktok = createTiktokLink(record['tiktok_account']);
        const youtube = createYoutubeLink(record['youtube_account']);
        const otherLink = createOtherLink(record['other_sns']);
        const links = `<span class="is-size-6">${xAccount}${instagram}${tiktok}${youtube}${otherLink}</span>`;

        const playerData = `
                data-player-id="${record['player_id']}" data-player-team-tag="${teamTag}"
                data-player-name="${record['player_name']}" data-player-x="${record['x_account']}"
                data-player-instagram="${record['instagram_account']}" data-player-tiktok="${record['tiktok_account']}"
                data-player-youtube="${record['youtube_account']}" data-player-other="${record['other_sns']}"
                data-player-points="${record['points']}" data-player-rank="${rank}" data-player-area="${record['area']}"
            `;

        // イベントカード要素の追加
        $('#standings-content tbody').append(
            `<tr class="player-record" ${playerData}>
                <td class="has-text-right has-text-weight-bold is-middle has-text-danger">${rank}</td>
                <td>
                    <p class="is-size-6 player-name-tag my-1">
                        ${newPlayerIcon}${updateIcon}<span class="has-text-weight-bold">${playerDispName}</span>${links}
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
