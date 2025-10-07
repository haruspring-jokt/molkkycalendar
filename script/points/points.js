/**
 * ページ読み込み時実行
 */
$(function () {
    //処理を書く部分

    /**
     * init event
     */
    fetchPointsStandings(true);
});

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

        // 件数分イベントカードを生成して追加する
        for (const i in datas) {
            if (i >= maxItems) {
                break;
            }
            const record = datas[i];

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
                `<tr>
                    <td style="text-align: right;">${record['rank']}</td>
                    <td style="text-align: right;">${record['points']}</td>
                    <td>${record['player_name']}${xAccount}${instagram}${tiktok}${youtube}</td>
                    <td>${teamTag}</td>
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
