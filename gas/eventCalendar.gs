function myFunction() {

}

/**
 * GETメソッドテスト用
 */
function testGet() {
  var e =
  {
    "parameter": {
      // "prefecture": "",
    }
  };
  return doGet(e);
}

/**
 * GETメソッド
 */
function doGet(e) {

  /*
   * パラメータの確認
   */
  var param = e.parameter;

  if (param == undefined) {
    //パラメータ不良の場合はundefinedで返す
    var getvalue = "undefined"

    //エラーはJSONで返すつもりなので
    var rowData = {};
    rowData.value = getvalue;
    var result = JSON.stringify(rowData);
    return ContentService.createTextOutput(result);

  } else {

    /*
     * イベントデータの取得
     */
    // 都道府県パラメータ
    var prefectureParam = param.prefecture;

    var prefectureKey = "";
    if (!prefectureParam || prefectureParam == "00") {
      // 都道府県パラメータが指定されていない場合は全取得とする
      prefectureKey = "00";
    } else {
      prefectureKey = convertPrefectureToName(prefectureParam);
    }

    // listデータをjsonに変換
    payload = JSON.stringify(createEvents(prefectureKey));
    ContentService.createTextOutput();
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(payload);
    return output;

  }
}

/**
 * イベント取得
 */
function createEvents(prefectureParam) {
  const id = "1neikRlOUUUmeZDgZh_NlzL-QDSTrJYt3fGmIV6IUjA4";
  const ss = SpreadsheetApp.openById(id)
  const sheet = ss.getSheetByName("イベント情報")
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange("A2:AJ" + lastRow + "");
  var values = range.getValues();
  // 都道府県で絞り込む
  if (prefectureParam == "00") {
  } else {
    values = values.filter(record => record[16] === prefectureParam);
  }

  let objectArray = [];

  var counter = 0;

  for (var i = 0; i < lastRow; i++) {
    if (typeof values[i] === 'undefined') {
      break;
    }
    if (values[i] == null) {
      break;
    }
    if (values[i][0] === "") {
      break;
    }
    if (Number(values[i][0]) < 10000) {
      // 各項目をJSONマップに格納する
      objectArray[counter] = {};
      objectArray[counter]["sk"] = values[i][0];
      objectArray[counter]["id"] = values[i][1];
      objectArray[counter]["serial"] = values[i][2];
      objectArray[counter]["registerDate"] = values[i][3];
      objectArray[counter]["updateDate"] = values[i][4];
      objectArray[counter]["eventDate"] = values[i][5];
      objectArray[counter]["eventStart"] = values[i][6];
      objectArray[counter]["eventEnd"] = values[i][7];
      objectArray[counter]["category"] = values[i][8];
      objectArray[counter]["longEventName"] = values[i][9];
      objectArray[counter]["seriesName"] = values[i][10];
      objectArray[counter]["source"] = values[i][11];
      objectArray[counter]["eventName"] = values[i][12];
      objectArray[counter]["eventShortName"] = values[i][13];
      objectArray[counter]["org"] = values[i][14];
      objectArray[counter]["orgShortName"] = values[i][15];
      objectArray[counter]["prefecture"] = values[i][16];
      objectArray[counter]["place"] = values[i][17];
      objectArray[counter]["address"] = values[i][18];
      objectArray[counter]["ground"] = values[i][19];
      objectArray[counter]["composition"] = values[i][20];
      objectArray[counter]["minMember"] = values[i][21];
      objectArray[counter]["maxMember"] = values[i][22];
      objectArray[counter]["rule"] = values[i][23];
      objectArray[counter]["teamNum"] = values[i][24];
      objectArray[counter]["entryStart"] = values[i][25];
      objectArray[counter]["entryEnd"] = values[i][26];
      objectArray[counter]["entryMethod"] = values[i][27];
      objectArray[counter]["entryFee"] = values[i][28];
      objectArray[counter]["entryRemarks"] = values[i][29];
      objectArray[counter]["tags"] = values[i][30];
      objectArray[counter]["remarks"] = values[i][31];
      objectArray[counter]["memo"] = values[i][32];
      objectArray[counter]["result"] = values[i][33];
      objectArray[counter]["article"] = values[i][34];
      objectArray[counter]["image"] = values[i][35];
      counter++;
    }
  }

  return objectArray
}

/**
 * 都道府県コードを都道府県名称に変換する
 */
function convertPrefectureToName(code) {
  const name = {
    '01': '北海道', '02': '青森', '03': '岩手', '04': '宮城', '05': '秋田', '06': '山形',
    '07': '福島', '08': '茨城', '09': '栃木', '10': '群馬', '11': '埼玉', '12': '千葉',
    '13': '東京', '14': '神奈川', '15': '新潟', '16': '富山', '17': '石川', '18': '福井',
    '19': '山梨', '20': '長野', '21': '岐阜', '22': '静岡', '23': '愛知', '24': '三重',
    '25': '滋賀', '26': '京都', '27': '大阪', '28': '兵庫', '29': '奈良', '30': '和歌山',
    '31': '鳥取', '32': '島根', '33': '岡山', '34': '広島', '35': '山口', '36': '徳島',
    '37': '香川', '38': '愛媛', '39': '高知', '40': '福岡', '41': '佐賀', '42': '長崎',
    '43': '熊本', '44': '大分', '45': '宮崎', '46': '鹿児島', '47': '沖縄'
  }[code];
  return name;
}
















