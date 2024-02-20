$(function () {
    //処理を書く部分
    $('#s-title').append('全国モルックイベント大会カレンダー');

    console.log('start getting events.')

    $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbxVFTgYPbWTy_iCmqfHiKYwWkipNELkvFVXERRMo4oPi85F9x_YwBHT4WGUmoClp_KG/exec',
        type: 'GET',
        dataType: 'json',
    }).done(function (datas) {
        var datasStringify = JSON.stringify(datas);
        var datasJson = JSON.parse(datasStringify);
        for (const i in datasJson) {
            const event = datas[i];

            // イベント種類のラベルカラー
            const labelColor = {
                '大会': 'primary',
                '大会（長期）': 'success',
                '体験会': 'default',
                '練習会': 'default',
                'ブース': 'default',
                'その他': 'default'
            }[event['category']];

            // 開催日の日付フォーマット変更
            const eventDate = new Date(event['eventDate']).toLocaleDateString();
            var eventTime = '';
            if (!(event['eventStart'] + event['eventEnd'])) { } else {
                eventTime = event['eventStart'] + ' - ' + event['eventEnd'];
            }

            // 個人・チーム構成
            var composition = '';
            if (event['composition'] == 'チーム') {
                composition = event['composition'] + '（' + event['minMember'] + '～' + event['maxMember'] + '）';
            } else {
                composition = event['composition'];
            }

            // 備考
            // エントリー備考
            var entryRemarks = '';
            if (!event['entryRemarks']) { } else {
                entryRemarks = event['entryRemarks'] + '<br>';
            }
            // 備考・メモ
            var remarks = '';
            if (!(event['remarks'] + event['memo'])) { } else {
                remarks = `
                    <div name="card-remarks-${i}" class="card-body">
                        <div class="toast">
                            ${entryRemarks}
                            ${event['remarks']} ${event['memo']}
                        </div>
                    </div>`;
            }

            // イベントカード要素の追加
            $('#event-columns').append(
                `<div name="outer-card-upper-${i}" class="column col-6 col-xs-12">
                    <div name="card-${i}" class="card">
                        <div name ="card-header-${i}" class="card-header text-large">
                            <div name="card-title-${i}" class="card-title h3">${event['eventName']}</div>
                            <div name="card-subtitle-${i} class="card-subtitle text-gray">${eventDate} ${eventTime} <span class="label label-rounded label-${labelColor}"> ${event['category']}</span></div>
                        </div>
                        <div name="card-body-${i}" class="card-body">
                            <ul class="menu">
                                <li class="menu-item btn"><a class="btn btn-link text-left" href="${event['source']}"> <i class="icon icon-link"></i> ソース（情報取得元）</a></li>
                                <li class="menu-item"> <small class="label text-bold">シリーズ</small> ${event['seriesName']}</li>
                                <li class="menu-item"> <small class="label text-bold">主催</small> ${event['org']}</li>
                                <li class="menu-item"> <small class="label text-bold">場所</small> <span class="label label-rounded">${event['prefecture']} </span> ${event['place']}</li>
                                <li class="menu-item"> <small class="label text-bold">ルール</small> ${composition}</li>
                                <li class="menu-item"> <small class="label text-bold">チーム/人</small> ${event['teamNum']}</li>
                                <li class="menu-item"> <small class="label text-bold">エントリー開始</small> ${event['entryStart']}</li>
                                <li class="menu-item"> <small class="label text-bold">参加費</small> ${event['entryFee']}</li>
                            </ul>
                        </div>
                        ${remarks}
                        <div name="card-footer-${i}" class="card-footer"></div>
                    </div>
                    <div name="outer-card-lower-${i}" class="">
                        <p></p>
                    </div>
                </div>`
            );
        }
        $('#tech-message > p').text(`情報取得完了: ${datasJson.length}件`);
        $('#tech-message > p').addClass('bg-success');
        $('#tech-message > progress').remove();
    });
});

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
