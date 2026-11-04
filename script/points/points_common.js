$(async function () {
    $('.navbar').removeClass('is-primary').addClass('is-danger');
    $('.footer').addClass('has-background-danger');
    appendPointsPageCommonParts();
});

function appendPointsPageCommonParts() {
    appendCommonPointsInfoForm();
    appendCommonPointsSiteLinks();
    appendCommonGoogleAds();
}

function buildTournamentResultApplicationUrl(info = {}) {
    const baseUrl = JajaConstants.formTournamentResult;
    const url = new URL(baseUrl);
    const eventDate = String(info.event_date || '').slice(0, 10);
    const playCategory = String(info.play_category || '').trim();
    const entryParams = JajaConstants.formTournamentResultEntryParams;

    const params = {
        [entryParams.tournamentName]: String(info.event_name || '').trim(),
        [entryParams.tournamentDate]: eventDate,
        [entryParams.organizer]: String(info.org || '').trim(),
        [entryParams.prefecture]: String(info.prefecture || '').trim(),
        [entryParams.playCategory]: playCategory,
        [entryParams.participantCount]: String(info.player_num || '').trim(),
    };

    if (playCategory === 'チーム戦') {
        const teamSize = String(info.team_size || '').trim();
        if (teamSize) {
            params[entryParams.teamSize] = teamSize;
        }
    }

    Object.entries(params).forEach(([key, value]) => {
        if (value !== '') {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
}

function createTournamentResultApplyButtonHtml(info = {}) {
    const formUrl = buildTournamentResultApplicationUrl(info);
    return `
        <p class="mt-1 mb-0">
            <a href="${formUrl}" target="_blank">
                <button class="button is-danger is-small p-1 px-2">
                    <i class="las la-file-upload has-text-light is-size-65"></i>
                    <span class="has-text-light is-size-7">申請</span>
                </button>
            </a>
        </p>
    `;
}

/**
 * 獲得ポイントの表示用文字色と太字クラスを返す。
 * @param {number|string} point
 * @returns {string}
 */
function getPointDisplayClass(point) {
    const pointValue = Number(point) || 0;
    const colorClass = pointValue >= 100
        ? 'has-text-danger'
        : pointValue >= 50
            ? 'has-text-primary'
            : pointValue >= 20
                ? 'has-text-success'
                : pointValue >= 10
                    ? 'has-text-info'
                    : 'has-text-grey';
    const weightClass = pointValue >= 20 ? 'has-text-weight-bold' : '';

    return `${colorClass} ${weightClass}`.trim();
}

/**
 * 参加規模ティアの表示用背景色クラスを返す。
 * @param {string} eventSizeTier
 * @returns {string}
 */
function getEventSizeTierDisplayClass(eventSizeTier) {
    const tier = String(eventSizeTier || '');
    return tier.startsWith('Ⅰ')
        ? 'is-danger'
        : tier.startsWith('Ⅱ')
            ? 'is-primary'
            : tier.startsWith('Ⅲ')
                ? 'is-success'
                : 'has-background-grey';
}

/**
 * 指定日が属するシーズンキー（例: "2526"）を返す。シーズンは毎年9/1開始。
 * @param {Date} dateValue
 * @returns {String}
 */
function getSeasonKey(dateValue = new Date()) {
    const year = dateValue.getFullYear();
    const month = dateValue.getMonth() + 1;
    const baseYear = month >= 9 ? year : year - 1;
    return `${String(baseYear).slice(2)}${String(baseYear + 1).slice(2)}`;
}

/**
 * シーズンキー（例: "2526"）から開始日・終了日を返す。
 * @param {String} seasonKey
 * @returns {{start: Date, end: Date}}
 */
function getSeasonRange(seasonKey) {
    const startYear = 2000 + parseInt(String(seasonKey).slice(0, 2), 10);
    const endYear = startYear + 1;
    return {
        start: new Date(startYear, 8, 1),
        end: new Date(endYear, 7, 31, 23, 59, 59, 999)
    };
}

/**
 * シーズンキーから "2025/9/1 - 2026/8/31" 形式の期間表示文字列を返す。
 * @param {String} seasonKey
 * @returns {String}
 */
function getSeasonRangeLabel(seasonKey) {
    const range = getSeasonRange(seasonKey);
    const fmt = (d) => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(range.start)} - ${fmt(range.end)}`;
}

/**
 * シーズンキーから "2025-26シーズン" 形式の表示名を返す。
 * @param {String} seasonKey
 * @returns {String}
 */
function getSeasonDisplayName(seasonKey) {
    const range = getSeasonRange(seasonKey);
    return `${range.start.getFullYear()}-${String(range.end.getFullYear()).slice(2)}シーズン`;
}

/**
 * 大会結果・選手データから、指定シーズンの順位表データを集計して返す。
 * 大会の開催日(event_date)が対象シーズン内にあるレコードのみを集計対象とする。
 * @param {Array} resultsData point_results.json 相当のデータ
 * @param {Array} playersData point_players.json 相当のデータ
 * @param {String} seasonKey
 * @returns {Array} ポイント降順にソートされた順位表データ
 */
function computeSeasonStandings(resultsData, playersData, seasonKey) {
    const range = getSeasonRange(seasonKey);
    const playerMap = new Map();
    playersData.forEach((p) => playerMap.set(p['player_id'], p));

    const aggregated = new Map();
    resultsData.forEach((rec) => {
        const eventDate = new Date(rec['event_date']);
        if (Number.isNaN(eventDate.getTime()) || eventDate < range.start || eventDate > range.end) {
            return;
        }
        const playerId = rec['player_id'];
        if (!aggregated.has(playerId)) {
            aggregated.set(playerId, {
                player_id: playerId,
                player_name: rec['player_name'],
                points: 0,
                rankin_count: 0,
                update_date: rec['create']
            });
        }
        const entry = aggregated.get(playerId);
        entry.points += Number(rec['points']) || 0;
        entry.rankin_count += 1;
        if (new Date(rec['create']) > new Date(entry.update_date)) {
            entry.update_date = rec['create'];
        }
    });

    const standings = Array.from(aggregated.values()).map((entry) => {
        const player = playerMap.get(entry.player_id) || {};
        return {
            ...entry,
            area: player['area'] || '',
            team_tag_1: player['team_tag_1'] || '',
            team_tag_2: player['team_tag_2'] || '',
            team_tag_3: player['team_tag_3'] || '',
            team_tag_4: player['team_tag_4'] || '',
            x_account: player['x_account'] || '',
            instagram_account: player['instagram_account'] || '',
            tiktok_account: player['tiktok_account'] || '',
            youtube_account: player['youtube_account'] || '',
            other_sns: player['other_sns'] || '',
            create_date: player['create'] || ''
        };
    });

    standings.sort((a, b) => b.points - a.points);
    return standings;
}
