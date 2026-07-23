let tournamentListData = [];

$(async function () {
    await fetchTournamentList();
    initTournamentListFilter();
});

async function fetchTournamentList() {
    try {
        const datas = await fetchTournaments("ALL");
        tournamentListData = datas;
        populateTournamentYearMonthFilter(datas);
        populateTournamentSeriesFilter(datas);
        populateTournamentSeasonFilter(datas);

        const currentSeason = getCurrentSeason();
        const seasonSelect = $('.filter-season');
        if (seasonSelect.find(`option[value="${currentSeason}"]`).length) {
            seasonSelect.val(currentSeason);
        }

        appendTournamentList(getFilteredTournamentData());
    } catch (error) {
        console.error('Error fetching tournament list:', error);
    }
}

function initTournamentListFilter() {
    createTournamentAreaFilter();
    $('input[name="filter-play-type"]').on('change', updateTournamentList);
    $('.filter-yearmonth').on('change', updateTournamentList);
    $('.filter-series').on('change', updateTournamentList);
    $('.filter-season').on('change', updateTournamentList);
    $('.filter-area').on('change', async function () {
        await updateTournamentList();
    });
}

function createTournamentAreaFilter() {
    const areaOptions = JajaConstants.areaSelects;
    areaOptions.forEach(opt => {
        $('.filter-area').append($('<option>').val(opt.key).text(opt.text));
    });
}

function populateTournamentYearMonthFilter(datas) {
    const yearMonthSet = new Set();
    datas.forEach(data => {
        const ym = getYearMonth(data.event_date);
        if (ym) {
            yearMonthSet.add(ym);
        }
    });
    const yearMonths = Array.from(yearMonthSet).sort((a, b) => b.localeCompare(a));
    const select = $('.filter-yearmonth');
    select.empty();
    select.append($('<option>').val('').text('すべて'));
    yearMonths.forEach(ym => {
        select.append($('<option>').val(ym).text(ym.replace('-', '/')));
    });
}

function getYearMonth(dateValue) {
    if (!dateValue) {
        return '';
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const year = date.getFullYear();
    const month = ('00' + (date.getMonth() + 1)).slice(-2);
    return `${year}-${month}`;
}

function getCurrentSeason(dateValue = new Date()) {
    const year = dateValue.getFullYear();
    const month = dateValue.getMonth() + 1;
    const baseYear = month >= 9 ? year : year - 1;
    return `${String(baseYear).slice(2)}${String(baseYear + 1).slice(2)}`;
}

function populateTournamentSeriesFilter(datas) {
    const seriesCounts = new Map();

    datas.forEach(data => {
        const seriesId = data.series_id;
        if (!seriesId) {
            return;
        }

        const current = seriesCounts.get(seriesId) || {
            seriesId,
            seriesName: data.series_name || '',
            count: 0,
        };

        current.count += 1;
        if (!current.seriesName && data.series_name) {
            current.seriesName = data.series_name;
        }
        seriesCounts.set(seriesId, current);
    });

    const seriesOptions = Array.from(seriesCounts.values())
        .filter(item => item.count >= 2)
        .sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            return (a.seriesId || '').localeCompare(b.seriesId || '');
        });

    const select = $('.filter-series');
    select.empty();
    select.append($('<option>').val('').text('すべて'));

    seriesOptions.forEach(item => {
        const label = item.seriesName + ' (' + item.count + ')' || item.seriesId;
        select.append($('<option>').val(item.seriesId).text(label));
    });
}

function populateTournamentSeasonFilter(datas) {
    const seasons = new Set();

    datas.forEach(data => {
        if (data.season) {
            seasons.add(data.season);
        }
    });

    const seasonOptions = Array.from(seasons).filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)));

    const select = $('.filter-season');
    select.empty();
    select.append($('<option>').val('').text('すべて'));

    seasonOptions.forEach(season => {
        select.append($('<option>').val(season).text(season));
    });
}

async function updateTournamentList() {
    appendTournamentList(getFilteredTournamentData());
}

function getFilteredTournamentData() {
    const selectedArea = $('.filter-area').val() || '00';
    const selectedPlayType = $('input[name="filter-play-type"]:checked').val() || 'all';
    const selectedYearMonth = $('.filter-yearmonth').val() || '';
    const selectedSeriesId = $('.filter-series').val() || '';
    const selectedSeason = $('.filter-season').val() || '';

    return tournamentListData.filter(data => {
        const matchesArea = isEqualsPrefectureCodeAndName(selectedArea, data.prefecture);
        if (!matchesArea) {
            return false;
        }

        if (selectedPlayType === 'individual') {
            if (data.play_category !== '個人戦') {
                return false;
            }
        } else if (selectedPlayType === 'team') {
            if (data.play_category === '個人戦') {
                return false;
            }
        }

        if (selectedYearMonth) {
            if (getYearMonth(data.event_date) !== selectedYearMonth) {
                return false;
            }
        }

        if (selectedSeriesId) {
            if (String(data.series_id || '') !== String(selectedSeriesId)) {
                return false;
            }
        }

        if (selectedSeason) {
            if (String(data.season || '') !== String(selectedSeason)) {
                return false;
            }
        }

        return true;
    });
}

function appendTournamentList(datas) {
    // datasを data.event_date の降順でソートする
    datas.sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        return dateB - dateA;
    });

    $("#tournament-list-content").empty(); // テーブルをクリア

    datas.forEach(data => {
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

        const results = [];
        for (let position = 1; position <= 2; position++) {
            var result = {
                position: position,
                point: data[`position_${position}_point`] || 0,
                pid: data[`position_${position}_pid`] || '',
                pname: data[`position_${position}_pname`] || '',
                pas: data[`position_${position}_pas`] || '',
                pother: data[`position_${position}_pother`] || ''
            };
            results.push(result);
        }

        const eventTeamRule = info.play_category == "個人戦" ?
            "SL" : "T" + info.team_size + "";
        const teamTagClass = eventTeamRule == "SL" ? "is-link has-text-weight-bold" : "is-success has-text-weight-bold";
        const pointTier = info.point_tier;
        const point = results[0].point;
        const pointTierClass = (function (pt) {
            switch ((pt || '').toString().toUpperCase()) {
                case 'S': return 'is-danger';
                case 'A': return 'is-primary';
                case 'B': return 'is-success';
                case 'C': return 'has-background-grey';
                default: return 'has-background-grey';
            }
        })(info.point_tier);
        // eventNameは20文字以上であれば省略する
        const eventName = info.event_name.length > 30 ?
            `<abbr title="${info.event_name}">${info.event_name.slice(0, 30) + "..."}</abbr>`
            : info.event_name;

        // 位置ごとのHTMLを生成
        const position1HTML = generatePositionHTML(results[0], info);
        const position2HTML = generatePositionHTML(results[1], info);
        const prefecture = info.prefecture === "その他・海外"
            ? "海外"
            : info.prefecture;


        $("#tournament-list-content").append(`
            <tr class="table is-size-7">
                <td class="is-middle py-2">
                    <p class="tags jaja-tags has-addons py-0 mb-1">
                        <span class="tag narrow ${teamTagClass}"><span class="has-text-light">${eventTeamRule}</span></span>
                        <span class="tag narrow is-light">${prefecture}</span>
                        <span class="tag narrow ${pointTierClass}"><span class="is-size-7 has-text-light has-text-weight-bold">
                            ${pointTier} ${point}</span></span>
                    </p>
                    <a href="../?id=${data.event_id}">${eventName}</a><br/>
                    ${info.series_name ? `<span class="mt-1 tag is-light shadow has-text-weight-semibold is-size-7">${info.series_name}</span>` : ''}
                </td>
                <td class="is-middle">
                    ${new Date(info.event_date).toLocaleDateString()}
                </td>
                <td class="is-middle">
                    ${position1HTML}
                </td>
                <td class="is-middle">
                    ${position2HTML}
                </td>
                <input type="hidden" name="series_id" value="${info.series_id || ''}">
                <input type="hidden" name="season" value="${info.season || ''}">
                <input type="hidden" name="id" value="${point}">
            </tr>    
        `);
    });
}

// プレイヤータグを生成する関数（カンマ区切りに対応）
function createPlayerLinks(pid, pname) {
    if (pid === '') {
        return '';
    }
    const pids = pid.split(',').map(p => p.trim());
    const pnames = pname ? pname.split(',').map(p => p.trim()) : [];
    return pids.map((p, index) =>
        `<a href="../../player?pid=${p}">${pnames[index] || p}</a>`
    ).join('<br/>');
}

// 位置ごとのプレイヤータグとチームタグを生成
function generatePositionHTML(result, info) {
    const playerTag = result.pid != "" ?
        createPlayerLinks(result.pid, result.pname)
        : `<i class="las la-ghost mr-1"></i>${result.pother}`;

    const teamTag = info.play_category !== "個人戦" && result.pas != "" ?
        (() => {
            const firstAs = result.pas.split(',')[0].trim();
            return `<br/><span class="has-text-grey">as ${firstAs}</span>`;
        })()
        : "";

    return playerTag + teamTag;
}
