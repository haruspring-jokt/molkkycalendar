$(async function () {
    await fetchTournamentList();
});

async function fetchTournamentList() {
    try {
        const datas = await fetchTournaments("ALL");
        appendTournamentList(datas);
    } catch (error) {
        console.error('Error fetching tournament list:', error);
    }
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
                    <p class="tags jaja-tags has-addons py-0 mb-0">
                        <span class="tag narrow ${teamTagClass}"><span class="has-text-light">${eventTeamRule}</span></span>
                        <span class="tag narrow is-light">${prefecture}</span>
                        <span class="tag narrow ${pointTierClass}"><span class="is-size-7 has-text-light has-text-weight-bold">
                            ${pointTier} ${point}</span></span>
                    </p>
                    <a href="../?id=${data.event_id}">${eventName}</a>
                    <input type="hidden" name="id" value="${point}">
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
