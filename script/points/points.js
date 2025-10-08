/**
 * ページ読み込み時実行
 */
$(function () {
    //処理を書く部分

    /**
     * init event
     */
    fetchPointsStandings(true);

    // player-recordクリックイベント
    $(document).on('click', '.player-record', function () {
        const playerId = $(this).data('player-id');
        if (playerId) {
            createPlayerDetail(playerId);
        }
    });
});

/**
 * 順位表の上に選手詳細を表示する。
 * @param {*} playerId 
 */
function createPlayerDetail(playerId) {
    // 既に表示されている場合は中身を空にする
    $('#player-detail-table').empty();
    // タップしたセルの背景色を変更
    $('.player-record').removeClass('bg-primary');
    $(`.player-record[data-player-id='${playerId}']`).addClass('bg-primary');

    // タップしたtrタグのplayer-name-tagクラスの中身を取得して選手名とする
    const playerName = $(`.player-record[data-player-id='${playerId}'] .player-name-tag`).text().trim();

    const publicUrl = "https://storage.googleapis.com/molkky-calendar-json/point_results.json";
    $.ajax({
        url: publicUrl,
        type: 'GET',
        dataType: 'json',
    }).done(function (datas) {
        // プレイヤーIDに該当するデータのみにフィルタ
        const playerData = datas.filter(record => record['player_id'] === playerId);
        // 日付の降順でソート
        playerData.sort((a, b) => new Date(b['event_date']) - new Date(a['event_date']));
        if (playerData.length == 0) {
            return;
        }
        var tableCell = "";
        for (const record of playerData) {
            // （個人戦orチーム戦）（開催地）大会日付・大会名
            const eventTeamRule = record['event_team_rule'] == "個人戦" ? "<label class='label label-rounded'>個人</label>" : "<label class='label label-rounded'>チーム</label>";
            // 大会日付（日付型をyyyy/m/d形式に変換）
            const eventDate = record['event_date'] != "" ? `<span class="text-small">${new Date(record['event_date']).toLocaleDateString()}</span>` : "";
            // エリア
            const eventArea = record['event_area'] != "" ? `<label class="label label-rounded">${record['event_area']}</label>` : "";
            // 大会名
            const eventName = record['event_name'] != "" ? `<span class="text">${record['event_name']}</span>` : "";
            // エントリー名
            const entryName = record['entry_team_name'] != "" ? `<span class="text-small">as ${record['entry_team_name']}</span>` : "";
            // 順位/参加数
            const eventRank = record['rank'] != "" ? `<span class="text-large"><strong>${record['rank']}</strong>位 / ${record['entry_num']}</span>` : "";
            // ポイント
            const eventPoints = record['points'] != "" ? `<span class="text-large text-primary">(<strong>${record['points']}Pts</strong>)</span>` : "";

            // イベントカード要素の追加
            tableCell +=
                `<tr>
                    <td>${eventDate}</td>
                    <td>${eventName} ${entryName}<br/>
                        ${eventTeamRule} ${eventArea}
                    </td>
                    <td>${eventRank} ${eventPoints}</td>
                </tr>`;
        }
        $('#player-detail-area').show();
        $('#player-detail-table').append(
            `<table class="table column col-xs-12 table-hover">
                <thead>
                    <tr>
                        <th>日付</th>
                        <th>大会</th>
                        <th>順位・Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableCell}
                </tbody>
            </table>`
        );
        // player-detail-pnameに選手名をセット
        $('#player-detail-pname').text(playerName);
    });
    // 選手詳細エリアまでスクロール
    const detailTop = $('#player-detail-area').offset().top;
    $('html, body').animate({ scrollTop: detailTop }, 'fast');
}

/**
 * イベント情報HTMLを作成してHTMLに追加する。
 * @param {boolean} isInit 初回動作か
 */
function fetchPointsStandings(isInit) {
    /**
     * イベント情報一覧読み込み・表示
     */
    const publicUrl = "https://storage.googleapis.com/molkky-calendar-json/point_current_season.json";
    const maxItems = 100;

    $.ajax({
        url: publicUrl,
        type: 'GET',
        dataType: 'json',
    }).done(function (datas) {

        var rank = 1;
        var tienum = 0;

        // 件数分イベントカードを生成して追加する
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

            const area = record['area'] != "" ? `<label class="label label-rounded">${record['area']}</label>` : "";

            // team_tag_1からteam_tag_4を配列にして、存在するものだけパイプでつなぐ
            const teamTag = [record['team_tag_1'], record['team_tag_2'], record['team_tag_3'], record['team_tag_4']]
                .filter(Boolean).join('｜');

            const xAccount = record['x_account'] != "" ?
                ` <span class="text-large">
                    <a href="https://x.com/${record['x_account']}" target="_blank">
                        <i class="lab la-twitter"></i></a></span>` : '';

            const instagram = record['instagram_account'] != "" ?
                ` <span class="text-large"> 
                    <a href="https://www.instagram.com/${record['instagram_account']}" target="_blank">
                        <i class="lab la-instagram"></i></a></span>` : '';

            const tiktok = record['tiktok_account'] != "" ?
                ` <span class="text"> 
                    <a href="https://www.tiktok.com/@${record['tiktok_account']}" target="_blank">
                        Ti</a></span>` : '';

            const youtube = record['youtube_account'] != "" ?
                ` <span class="text-large">
                    <a href="https://www.youtube.com/@${record['youtube_account']}" target="_blank">
                        <i class="lab la-youtube"></i></a></span>` : '';

            // const discord = record['discord_account'] != "" ?
            //     ` <span class="text-large">
            //         <a href="https://www.discordapp.com/users/${record['discord_account']}" target="_blank">
            //             <i class="lab la-discord"></i></a></span>` : '';

            // イベントカード要素の追加
            $('#standings-table-body').append(
                `<tr class="player-record" data-player-id="${record['player_id']}">
                    <td style="text-align: right;">${rank}</td>
                    <td><span class="text-large player-name-tag"><strong>${record['player_name']}</strong> ${xAccount}${instagram}${tiktok}${youtube}</span><br/>
                        ${area} <span class="text-small">${teamTag}</span></td>
                    <td class="text-large" style="text-align: right;">${record['points']}</td>
                    <td style="text-align: right;">${record['rankin_count']}</td>
                </tr>`
            );
        }
        // 一覧表示完了イベント
        return datas.length;
    });
}

/**
 * トップスクロール
 */
var vGoTop = {};
function goTop() {

    vGoTop["coef"] = 50;  // ←滑らか係数（大きいほど滑らか）
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
