class JajaConstants {
    static get youtube() {
        return "https://youtube.com/@molkkyclanjajapatatas/";
    }
    static get twitter() {
        return "https://x.com/molkkycalendar";
    }
    static get suzuri() {
        return "https://suzuri.jp/haruspring_jokt/";
    }
    static get blog() {
        return "https://blog.jajapatatas.com/";
    }
    static get archive2026() {
        return "https://docs.google.com/spreadsheets/d/1_YkA48QMmdshBVWfGWFppTWsTlFJfpct1-lyhgob7X8";
    }
    static get archive2025() {
        return "https://docs.google.com/spreadsheets/d/1neikRlOUUUmeZDgZh_NlzL-QDSTrJYt3fGmIV6IUjA4";
    }
    static get archive2024() {
        return "https://docs.google.com/spreadsheets/d/1TrmgKPVHvg1VqF4sXU_NGf5-rVghhFNv3pYrgKlhMEE";
    }
    static get archive2023() {
        return "https://docs.google.com/spreadsheets/d/1AgddHVxbOcQPw0duGCAKDQLIqXu3K4hzRoVxnSGFRBk";
    }
    static get formFormat() {
        return "https://docs.google.com/forms/d/e/1FAIpQLSc2YoTNKP18VHvYUvzksLNJDnxMIi_dUWtneS5pYyBHHiR8PQ/viewform";
    }
    static get formFree() {
        return "https://docs.google.com/forms/d/e/1FAIpQLSdckaqci6BQdFR01mOKFSy6Le2_RUY3weyc2nrQocFp9Vz1aw/viewform";
    }
    static get scoresheet() {
        return "https://drive.google.com/drive/folders/17MPlK0MsZkxTMi0IvWQqxDdFdnD2a9Pm?usp=sharing";
    }
    static get molkkyprime() {
        return "https://www.molkkyprime.com";
    }
    static get fullPath() {
        return {
            points: "https://jajapatatas.com/points"
        }
    }
    static get defaultCalendarFilterParam() {
        return {
            "area": "00",
            "dateDiff": 30,
            "category": "0"
        };
    }
    static get areaSelects() {
        return [
            { "key": "00", "text": "すべて" },
            { "key": "A1", "text": "【北海道・東北エリア】" },
            { "key": "A2", "text": "【関東エリア】" },
            { "key": "A3", "text": "【東海エリア】" },
            { "key": "A4", "text": "【甲信越・北陸エリア】" },
            { "key": "A5", "text": "【関西エリア】" },
            { "key": "A6", "text": "【中国エリア】" },
            { "key": "A7", "text": "【四国エリア】" },
            { "key": "A8", "text": "【九州・沖縄エリア】" },
            { "key": "01", "text": "北海道" },
            { "key": "02", "text": "青森県" },
            { "key": "03", "text": "岩手県" },
            { "key": "04", "text": "宮城県" },
            { "key": "05", "text": "秋田県" },
            { "key": "06", "text": "山形県" },
            { "key": "07", "text": "福島県" },
            { "key": "08", "text": "茨城県" },
            { "key": "09", "text": "栃木県" },
            { "key": "10", "text": "群馬県" },
            { "key": "11", "text": "埼玉県" },
            { "key": "12", "text": "千葉県" },
            { "key": "13", "text": "東京都" },
            { "key": "14", "text": "神奈川県" },
            { "key": "15", "text": "新潟県" },
            { "key": "16", "text": "富山県" },
            { "key": "17", "text": "石川県" },
            { "key": "18", "text": "福井県" },
            { "key": "19", "text": "山梨県" },
            { "key": "20", "text": "長野県" },
            { "key": "21", "text": "岐阜県" },
            { "key": "22", "text": "静岡県" },
            { "key": "23", "text": "愛知県" },
            { "key": "24", "text": "三重県" },
            { "key": "25", "text": "滋賀県" },
            { "key": "26", "text": "京都府" },
            { "key": "27", "text": "大阪府" },
            { "key": "28", "text": "兵庫県" },
            { "key": "29", "text": "奈良県" },
            { "key": "30", "text": "和歌山県" },
            { "key": "31", "text": "鳥取県" },
            { "key": "32", "text": "島根県" },
            { "key": "33", "text": "岡山県" },
            { "key": "34", "text": "広島県" },
            { "key": "35", "text": "山口県" },
            { "key": "36", "text": "徳島県" },
            { "key": "37", "text": "香川県" },
            { "key": "38", "text": "愛媛県" },
            { "key": "39", "text": "高知県" },
            { "key": "40", "text": "福岡県" },
            { "key": "41", "text": "佐賀県" },
            { "key": "42", "text": "長崎県" },
            { "key": "43", "text": "熊本県" },
            { "key": "44", "text": "大分県" },
            { "key": "45", "text": "宮崎県" },
            { "key": "46", "text": "鹿児島県" },
            { "key": "47", "text": "沖縄県" },
            { "key": "A0", "text": "【海外】" }
        ]
    }
    static get areaList() {
        return {
            'A1': ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '北海道・東北その他'],
            'A2': ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '関東その他'],
            'A4': ['新潟', '富山', '石川', '福井', '山梨', '長野', '甲信越・北陸その他'],
            'A3': ['岐阜', '静岡', '愛知', '三重', '東海その他'],
            'A5': ['滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '関西その他'],
            'A6': ['鳥取', '島根', '岡山', '広島', '山口', '中国その他'],
            'A7': ['徳島', '香川', '愛媛', '高知', '四国その他'],
            'A8': ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄', '九州・沖縄その他'],
            'A0': ['海外']
        };
    }
    static get prefectureList() {
        return {
            '01': '北海道', '02': '青森', '03': '岩手', '04': '宮城', '05': '秋田', '06': '山形',
            '07': '福島', '08': '茨城', '09': '栃木', '10': '群馬', '11': '埼玉', '12': '千葉',
            '13': '東京', '14': '神奈川', '15': '新潟', '16': '富山', '17': '石川', '18': '福井',
            '19': '山梨', '20': '長野', '21': '岐阜', '22': '静岡', '23': '愛知', '24': '三重',
            '25': '滋賀', '26': '京都', '27': '大阪', '28': '兵庫', '29': '奈良', '30': '和歌山',
            '31': '鳥取', '32': '島根', '33': '岡山', '34': '広島', '35': '山口', '36': '徳島',
            '37': '香川', '38': '愛媛', '39': '高知', '40': '福岡', '41': '佐賀', '42': '長崎',
            '43': '熊本', '44': '大分', '45': '宮崎', '46': '鹿児島', '47': '沖縄'
        };
    }
    static get categoryFilters() {
        return [
            { key: "0", name: "すべて" },
            { key: "9", name: "注目イベント" },
            { key: "1", name: "大会" },
            { key: "2", name: "長期の大会" },
            { key: "7", name: "大会すべて" },
            { key: "3", name: "体験会・練習会" },
            { key: "5", name: "ブース" },
            { key: "6", name: "その他" }
        ];
    }
    static get amazonBoxList() {
        function getLink(dp) {
            return `https://www.amazon.co.jp/dp/${dp}?tag=molkkycalenda-22&amp;linkCode=osi&amp;th=1&amp;psc=1`;
        }
        return [
            {
                img: "https://m.media-amazon.com/images/I/41rwQkiTMZL._SL500_.jpg",
                title: "モルック 公式 リフィル セット 日本正規品 (スキットルのみ 1-12番）",
                link: getLink("B0D48MMXPF"),
                org: "OHSサプライ(OHS Supply)",
            },
            {
                img: "https://m.media-amazon.com/images/I/31TT7+z3BXL._SL500_.jpg",
                title: "公式 日本正規品 TACTIC モルック棒 2本セット モルック MOLKKY (正規品 公式 OHSサプライ 外遊び 大会 スポーツ 人気)",
                link: getLink("B0CW4XQNLR"),
                org: "OHSサプライ(OHS Supply)",
            },
            {
                img: "https://m.media-amazon.com/images/I/41YjtrMLYAL._SL500_.jpg",
                title: "モルック トーナメントモデル (公式バック、モルッカーリ付き） 日本正規公式品",
                link: getLink("B0B11WN3YB"),
                org: "OHSサプライ(OHS Supply)",
            }
        ]
    }
    static get molkkyCalendarEventsStorage() {
        return "https://storage.googleapis.com/molkky-calendar-json/events.json";
    }
    static get molkkyCalendarStorage() {
        const root = "https://storage.googleapis.com/";
        const bucket = "molkky-calendar-json/";
        const suffix = ".json";
        return {
            events: root + bucket + "events" + suffix,
            recent: root + bucket + "recent" + suffix,
            points: {
                currentSeason: root + bucket + "point_current_season" + suffix,
                results: root + bucket + "point_results" + suffix,
                players: root + bucket + "point_players" + suffix,
                tournaments: root + bucket + "point_tournaments" + suffix
            }
        };
    }
}
