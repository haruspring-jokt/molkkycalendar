# モルックカレンダー / ポイントランキング プロジェクト分析メモ

作成日: 2026-08-04

## 1. プロジェクト概要

このプロジェクトは、モルックに関する大会・練習会・体験会・関連イベントの情報をまとめて閲覧できる静的サイトです。

- 本番サイト: https://www.jajapatatas.com/
- サブプロジェクト: https://www.jajapatatas.com/points/

本番サイトは「イベントカレンダー」として、モルック関連イベントの情報を一覧・検索・参照できる構成です。
一方、/points 配下は「オープン大会独自ポイントランキング」機能を提供し、大会結果の申請・ランキング表示・選手/大会詳細閲覧を行います。

## 2. アーキテクチャの要点

### 2.1 全体構成

- フロントエンドは静的HTML + JavaScript + CSSで構成されています。
- 主要なUIはjQueryとBulmaを利用した構成です。
- サーバーサイドやデータベースは見当たらず、データは外部のJSONファイルを取得して表示しています。
- ルートページ、簡易表示、最近追加イベント、動画ページ、イベント個別詳細ページ、ポイントランキング系ページが分かれています。

### 2.2 主要技術

- HTML: 各ページの構造定義
- JavaScript: 表示ロジック、データ取得、フィルター処理、イベントハンドリング
- jQuery: DOM操作・AJAX通信
- Bulma + Sass: UIフレームワーク・スタイル
- Google Cloud Storage JSON: イベント・ランキング・動画データの取得元

### 2.3 主要ファイル

- ルートページ: [index.html](../index.html)
- イベント詳細ページ: [article/index.html](../article/index.html)
- 共通スクリプト: [script/script.js](../script/script.js)
- 共通定数: [script/jaja_constants.js](../script/jaja_constants.js)
- トップページ処理: [script/top.js](../script/top.js)
- 主催者ページ: [organizer/index.html](../organizer/index.html)
- 主催者スクリプト: [script/organizer.js](../script/organizer.js)
- 最近追加ページ: [script/recent/recent.js](../script/recent/recent.js)
- シンプル表示ページ: [script/simple/simple.js](../script/simple/simple.js)
- 動画ページ: [script/video/video.js](../script/video/video.js)
- ポイントランキング共通: [script/points/points_common.js](../script/points/points_common.js)
- ポイントランキングトップ: [script/points/points.js](../script/points/points.js)
- 選手詳細: [script/points/player/player.js](../script/points/player/player.js)
- 大会詳細: [script/points/tournament/tounament.js](../script/points/tournament/tounament.js)
- 大会一覧: [script/points/tournament/list.js](../script/points/tournament/list.js)

## 3. 主要機能要件

### 3.1 イベントカレンダー機能

ルートページでは、以下のような機能を提供しています。

- イベント一覧の表示
- 日付ごとのグルーピング表示
- 都道府県・エリアフィルター
- 日付範囲フィルター
- カテゴリフィルター
- 条件リセット
- Googleマップへのリンク
- Googleカレンダー登録用リンクの生成
- 最近追加イベントおよび最近の動画の表示
- イベントの詳細ページへの内部遷移
- 申請フォーム・関連リンクの表示
- 広告・Amazon提携バナーの表示

### 3.2 表示バリエーション

- [index.html](../index.html): 通常のカレンダー表示
- [simple/index.html](../simple/index.html): シンプルな表形式表示
- [recent/index.html](../recent/index.html): 最新更新順に絞った表示
- [video/index.html](../video/index.html): 最近の動画・ライブ配信一覧

### 3.3 ポイントランキング機能

/points 配下では、次の機能を提供しています。

- ランキング表示（現在シーズンの順位表）
- 最近登録されたポイントの表示
- お知らせの表示
- 選手詳細ページ
- 大会詳細ページ
- 大会一覧ページ
- シリーズ・シーズン・個人戦/チーム戦のフィルター
- 申請フォームへの導線

## 4. 実装仕様

### 4.1 データ取得方式

イベント・ランキング・動画データは、Google Cloud StorageのJSONをAJAXで取得して表示しています。

- イベント一覧: [script/jaja_constants.js](../script/jaja_constants.js) 内の `molkkyCalendarStorage.events`
 - 主催者情報: `script/jaja_constants.js` 内の `molkkyCalendarStorage.org`（org.json の URL）
- 最近イベント: `recent`
- 最近動画: `recent_videos`
- ポイントランキング: `JajaConstants.molkkyCalendarStorage.points.getSeasonUrl(season)`, `point_results`, `point_players`, `point_tournaments`

### 4.2 フィルターと状態管理

検索やフィルターの状態は `localStorage` に保存されます。

- `areaFilter`: 都道府県・エリアフィルター
- `dateFilterDiff`: 日付範囲の差分
- `categoryFilter`: カテゴリフィルター

これにより、ページ更新後も前回の条件を引き継げる構成です。

### 4.3 イベント表示ルール

イベントの表示では、以下のような情報を扱っています。

- 開催日
- 開催時間
- イベント名
- 種別（大会 / 練習会 / 体験会 / ブース / その他）
- 都道府県・エリア
- 主催者
- 会場
- ルール・構成
- 参加費
- 備考
- 詳細記事URL / ソースURL
- 更新日・登録日

### 4.4 ポイントランキングのルール（コード上の仕様）

ポイントランキング側では、以下の条件が画面上で明示されています。

- 対象は「オープン大会」
- エントリー条件がない大会
- シーズン期間: 2025/9/1〜2026/8/31
- 参加数が16未満は対象外
- 順位が全体上位50%より下回る場合は対象外
- 事前告知されていない大会は対象外
- 一般的なモルックのルール以外の特別ルールは対象外
- 申請者が主催・運営を担当している場合は申請不可

さらに、コード上では以下のような表示・集計ルールがあります。

- 順位表はポイント順に並び、同点は同順位扱いのような表示ロジック
- 選手詳細では入賞履歴・トロフィー/メダル数を表示
- 大会詳細では順位表、点数、シリーズ情報、VOD・SNS・画像を表示
- 大会一覧ではシリーズID・シーズン・個人戦/チーム戦・都道府県で絞り込み可能

## 5. データモデルのイメージ

### 5.1 イベントデータ

イベントJSONに期待される主要キー例:

- `eventDate`
- `eventStart`, `eventEnd`
- `eventName`
- `category`
- `prefecture`
- `place`
- `org`
- `article`, `source`
- `updateDate`, `registerDate`
- `seriesName`, `pickupSerial`

### 5.2 ポイントランキングデータ

- `point_season_XXXX.json`: ランキング用データ
  - `player_id`, `player_name`, `points`, `rankin_count`, `area`, `update_date`
  - シーズン名は `JajaConstants.currentSeason` と `JajaConstants.pointSeasonList` で管理し、URL生成は `getSeasonUrl(season)` に集約する
- `point_results`: 選手別の入賞結果
  - `player_id`, `event_id`, `event_name`, `event_date`, `rank`, `points`
- `point_players`: 選手プロフィール
  - `player_id`, `player_name`, `area`, `team_tag_*`, SNSアカウント、登録日
- `point_tournaments`: 大会データ
  - `event_id`, `event_name`, `event_date`, `play_category`, `player_num`, `point_tier`, `season`, `series_id`

## 6. 運用上の特徴

- 管理画面や管理用APIは実装されておらず、イベント登録は外部フォームと外部データ更新に依存しています。
- 申請・掲載依頼はGoogleフォーム経由です。
- 画像・動画・外部リンクは主に外部サービスに依存しています。
- サイト自体は静的に配信されるため、簡単な保守・改修に向いています。

## 7. 既知の実装上の傾向

- コードは「共通処理をまとめた後、各ページで独自表示を差し込む」構造です。
- 一部のページは共通のヘッダー/フッター/広告/リンク部品を再利用しています。
- 表示ロジックはHTML文字列を直接組み立てる形で、今後の保守性向上の余地があります。
- 現在のコードからは自動テスト群は見当たらず、動作確認はブラウザ上での手動確認が中心です。
 - 最近の変更（概要）:
  - 共通ユーティリティの整理: `script/script.js` に `createImageDiv`, `createArticleLink`, `createDetailLabel`, `getEventDetailHref`, `escapeHtml` などを移動し集約。
  - 詳細開閉ハンドラの共通化: `detailOpenEvent()` を `script/script.js` に移動して全ページで初期化、個別ページからの重複バインディングを削除。
  - 主催者ページの追加: `organizer/index.html` と `script/organizer.js` を実装し、`orgId` による主催者情報（org.json）とその主催イベント一覧を表示する機能を追加。
  - 主催者リンク化: `top.js` / `simple.js` / `article.js` 側で `event.orgId` が存在する場合に主催者名を `/organizer?orgId=` へリンク化。
  - レイアウト修正: organizer のイベントカードを1列表示に変更、ヘッダー/フッターの重複生成を防止する修正を適用。
  - 定数追加: `script/jaja_constants.js` に `molkkyCalendarStorage.org`（org.json URL）を追加。
  - 構文チェック: 主要スクリプト群に対し簡易的な JavaScript 構文チェックを実行し、構文エラーは検出されていません。

  備考: 変更は既にリポジトリに反映された前提で記載しています。追加でブラウザでの実動作検証（画像表示、開閉、リンク遷移、レスポンシブ等）を行うことを推奨します。

