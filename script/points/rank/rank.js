$(async function () {
    await initRankPage();
});

async function initRankPage() {
    const params = new URLSearchParams(window.location.search);
    const seasonKey = params.get('season') || getSeasonKey(new Date());
    appendRankHeading(seasonKey);
    await fetchRankStandings(seasonKey);
}

function appendRankHeading(seasonKey) {
    const range = getSeasonRange(seasonKey);
    const seasonLabel = `${range.start.getFullYear()}-${String(range.end.getFullYear()).slice(2)}`;
    $('#rank-title').text(`${getSeasonDisplayName(seasonKey)} ランキング`);
    $('#rank-subtitle').text(getSeasonRangeLabel(seasonKey));
    $('#breadcrumb-season-label').text(seasonLabel);
    $('#breadcrumb-season-label').attr('href', `./?season=${seasonKey}`);
    document.title = `${getSeasonDisplayName(seasonKey)} ランキング｜モルックオープン大会ポイントランキング｜全国モルックカレンダー`;
}

async function fetchRankStandings(seasonKey) {
    try {
        const [resultsData, playersData] = await Promise.all([
            fetchPointsDetailByPlayer(''),
            fetchPlayerDetail('')
        ]);
        const datas = computeSeasonStandings(resultsData, playersData, seasonKey);
        appendStandings(datas, {
            targetSelector: '#standings-content tbody',
            maxItems: datas.length
        });
    } catch (error) {
        console.error('Error fetching standings:', error);
    }
}

function appendStandings(datas, options = {}) {
    var rank = 1;
    var tienum = 0;
    const targetSelector = options.targetSelector || '#standings-content tbody';
    const maxItems = options.maxItems || 100;

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
        $(targetSelector).append(
            `<tr class="player-record" ${playerData}>
                <td class="has-text-right has-text-weight-bold is-middle has-text-danger">${rank}</td>
                <td>
                    <p class="is-size-6 player-name-tag my-1">
                        ${newPlayerIcon}${updateIcon}
                        <a href="../player/?pid=${record['player_id']}">
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
