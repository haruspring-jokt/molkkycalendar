import { google } from 'googleapis';

const MASTER_SPREADSHEET_ID = process.env.MASTER_SPREADSHEET_ID;
const EVENT_SPREADSHEET_ID = process.env.EVENT_SPREADSHEET_ID;
const APPS_SCRIPT_ID = process.env.APPS_SCRIPT_ID;
const EVENT_SHEET_NAME = 'イベント情報';
const MASTER_SHEET_NAME = '主催マスタ';
const ALLOWED_ORIGINS = new Set([
    'https://www.jajapatatas.com',
    'http://127.0.0.1:8080',
    'http://localhost:8080'
]);
const EVENT_CATEGORIES = new Set(['大会', '大会（長期）', '練習会', '体験会', 'その他', 'ブース']);

class RequestError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

export async function helloHttp(req, res) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.has(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Vary', 'Origin');
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        if (!ALLOWED_ORIGINS.has(origin)) {
            res.status(403).send({ error: 'Origin Not Allowed' });
            return;
        }
        res.status(204).send('');
        return;
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
        res.status(403).send({ error: 'Origin Not Allowed' });
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method Not Allowed' });
        return;
    }

    let phase = '設定確認';
    let rowWritten = false;
    let eventName = '';
    let sequence = '';

    try {
        validateConfiguration();
        const requestData = validateRequestBody(req.body);
        const auth = createGoogleAuth();

        phase = '認証ID照合';
        const organizer = await findOrganizer(auth, requestData.secretKey);

        phase = 'イベント情報確認';
        const event = validateEventData(requestData);
        eventName = event.eventName;

        const sheets = google.sheets({ version: 'v4', auth });
        const sheet = await getEventSheet(sheets);
        const [sequenceValue, sequenceColumn] = await Promise.all([
            getNextSequenceValue(sheets),
            getEventSequenceColumn(sheets)
        ]);
        sequence = sequenceValue;

        const rowNumber = findNextRowNumber(sequenceColumn);
        const registrationDate = getTodayInJapan();

        phase = 'イベント情報シートの行追加';
        await appendSheetRow(sheets, sheet.sheetId, sheet.gridProperties.rowCount);

        phase = 'イベント情報シートへの記録';
        await writeEventRow(sheets, rowNumber, sequenceValue, registrationDate, event, organizer.name);
        rowWritten = true;

        phase = 'ソートキー反映待ち';
        await delay(60_000);

        phase = 'イベント情報の並べ替え';
        await sortEvents(sheets, sheet.sheetId, rowNumber);

        phase = 'GAS uploadAll 実行';
        await runUploadAll(auth);

        phase = 'Discord通知';
        try {
            await sendDiscordNotification({
                organizerName: organizer.name,
                eventName: event.eventName,
                eventDate: event.eventDate,
                place: event.place,
                source: event.source,
                sequence: sequenceValue
            });
        } catch (error) {
            console.error('Discord通知に失敗しました。イベント処理は継続します。', {
                sequence: sequenceValue,
                message: error instanceof Error ? error.message : String(error)
            });
        }

        res.status(202).send({
            success: true,
            message: 'イベント作成リクエストを受け付けました。'
        });
    } catch (error) {
        console.error('イベント作成リクエストの処理に失敗しました。', {
            phase,
            eventName,
            sequence,
            message: error instanceof Error ? error.message : String(error)
        });

        const statusCode = error instanceof RequestError ? error.statusCode : 500;
        const message = rowWritten
            ? 'イベント情報を記録した後の更新処理に失敗しました。重複投稿を避けるため再送信せず、管理者へご連絡ください。'
            : error instanceof RequestError
                ? error.message
                : 'サーバー内部でエラーが発生しました。時間をおいて再度お試しください。';
        res.status(statusCode).send({ error: message });
    }
}

function validateConfiguration() {
    const requiredVariables = [
        'GOOGLE_OAUTH_CLIENT_ID',
        'GOOGLE_OAUTH_CLIENT_SECRET',
        'GOOGLE_OAUTH_REFRESH_TOKEN',
        'DISCORD_WEBHOOK_URL'
    ];
    const missingVariables = requiredVariables.filter((name) => !process.env[name]);
    if (missingVariables.length > 0) {
        throw new Error(`Required environment variables are missing: ${missingVariables.join(', ')}`);
    }
}

function validateRequestBody(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new RequestError(400, '送信データの形式が正しくありません。');
    }

    const secretKey = typeof body.secretKey === 'string' ? body.secretKey.trim() : '';
    if (!/^[A-Za-z0-9]{8}$/.test(secretKey)) {
        throw new RequestError(400, '認証IDは半角英数字8桁で入力してください。');
    }

    return { ...body, secretKey };
}

function createGoogleAuth() {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    auth.setCredentials({
        refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    });
    return auth;
}

async function findOrganizer(auth, secretKey) {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: MASTER_SPREADSHEET_ID,
        range: `'${MASTER_SHEET_NAME}'!A:S`,
        valueRenderOption: 'FORMATTED_VALUE'
    });
    const rows = response.data.values || [];
    const matches = rows.slice(1).filter((row) => String(row[18] ?? '').trim() === secretKey);

    if (matches.length === 0) {
        throw new RequestError(401, '認証IDが正しくありません。');
    }
    if (matches.length > 1) {
        throw new Error('The authentication ID matches more than one organizer.');
    }

    const organizerId = String(matches[0][0] ?? '').trim();
    const name = String(matches[0][4] ?? '').trim();
    if (!organizerId || !name) {
        throw new Error('The matched organizer is missing its ID or display name.');
    }

    return { id: organizerId, name };
}

function validateEventData(data) {
    const eventDate = getRequiredString(data, 'eventDate', '開催日付');
    if (!isValidDate(eventDate)) {
        throw new RequestError(400, '開催日付を正しく入力してください。');
    }

    const category = getRequiredString(data, 'category', '種別');
    if (!EVENT_CATEGORIES.has(category)) {
        throw new RequestError(400, '種別の値が正しくありません。');
    }

    const source = getRequiredString(data, 'source', 'ソース');
    if (!isHttpUrl(source)) {
        throw new RequestError(400, 'ソースにはhttpまたはhttpsから始まるURLを入力してください。');
    }

    const eventName = getRequiredString(data, 'eventName', 'イベント名称');
    const prefecture = getRequiredString(data, 'prefecture', '都道府県');
    const image = getOptionalString(data, 'image');
    if (image && !isHttpUrl(image)) {
        throw new RequestError(400, 'イベント画像URLにはhttpまたはhttpsから始まるURLを入力してください。');
    }

    const eventStart = getOptionalString(data, 'eventStart');
    const eventEnd = getOptionalString(data, 'eventEnd');
    if ((eventStart && !isValidTime(eventStart)) || (eventEnd && !isValidTime(eventEnd))) {
        throw new RequestError(400, '開始時間・終了時間はhh:mm形式で入力してください。');
    }

    const teamSizeMin = getOptionalNaturalNumber(data, 'teamSizeMin');
    const teamSizeMax = getOptionalNaturalNumber(data, 'teamSizeMax');
    if (teamSizeMin !== '' && teamSizeMax !== '' && teamSizeMin > teamSizeMax) {
        throw new RequestError(400, 'チーム人数最少は最大以下の値を入力してください。');
    }

    return {
        eventDate: toSheetDate(eventDate),
        eventStart,
        eventEnd,
        category,
        seriesName: getOptionalString(data, 'seriesName'),
        source,
        eventName,
        prefecture,
        place: getOptionalString(data, 'place'),
        surface: getOptionalString(data, 'surface'),
        configuration: getOptionalString(data, 'configuration'),
        teamSizeMin,
        teamSizeMax,
        rules: getOptionalString(data, 'rules').replace(/[\r\n\u3000]+/g, ' ').trim(),
        capacity: getOptionalString(data, 'capacity'),
        entryStart: getOptionalString(data, 'entryStart'),
        entryEnd: getOptionalString(data, 'entryEnd'),
        entryMethod: getOptionalString(data, 'entryMethod'),
        entryFee: getOptionalString(data, 'entryFee'),
        entryOther: getOptionalString(data, 'entryOther'),
        remarks: getOptionalString(data, 'remarks'),
        image
    };
}

function getRequiredString(data, key, label) {
    const value = getOptionalString(data, key);
    if (!value) {
        throw new RequestError(400, `${label}を入力してください。`);
    }
    return value;
}

function getOptionalString(data, key) {
    const value = data[key];
    if (value === undefined || value === null || value === '') {
        return '';
    }
    if (typeof value !== 'string') {
        throw new RequestError(400, `${key}の入力形式が正しくありません。`);
    }
    return value.trim();
}

function getOptionalNaturalNumber(data, key) {
    const value = data[key];
    if (value === undefined || value === null || value === '') {
        return '';
    }
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 1) {
        throw new RequestError(400, `${key}は1以上の自然数で入力してください。`);
    }
    return number;
}

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toSheetDate(value) {
    return value.replace(/-/g, '/');
}

function isValidTime(value) {
    return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

async function getEventSheet(sheets) {
    const response = await sheets.spreadsheets.get({
        spreadsheetId: EVENT_SPREADSHEET_ID,
        fields: 'sheets(properties(sheetId,title,gridProperties(rowCount)))'
    });
    const sheet = (response.data.sheets || [])
        .map((item) => item.properties)
        .find((properties) => properties.title === EVENT_SHEET_NAME);
    if (!sheet) {
        throw new Error(`The "${EVENT_SHEET_NAME}" sheet was not found.`);
    }
    return sheet;
}

async function getNextSequenceValue(sheets) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: EVENT_SPREADSHEET_ID,
        range: `'${EVENT_SHEET_NAME}'!C1`,
        valueRenderOption: 'FORMATTED_VALUE'
    });
    const cellValue = String(response.data.values?.[0]?.[0] ?? '');
    const match = cellValue.match(/^次\s*[：:]\s*(\d+)\s*$/);
    if (!match) {
        throw new Error('The sequence value in cell C1 is missing or malformed.');
    }
    const sequence = Number(match[1]);
    if (!Number.isSafeInteger(sequence)) {
        throw new Error('The sequence value in cell C1 is outside the safe integer range.');
    }
    return sequence;
}

async function getEventSequenceColumn(sheets) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: EVENT_SPREADSHEET_ID,
        range: `'${EVENT_SHEET_NAME}'!C2:C`,
        valueRenderOption: 'FORMATTED_VALUE'
    });
    return response.data.values || [];
}

function findNextRowNumber(sequenceColumn) {
    let lastDataRowNumber = 1;
    sequenceColumn.forEach(([sequence], index) => {
        if (String(sequence ?? '').trim() !== '') {
            lastDataRowNumber = index + 2;
        }
    });
    return lastDataRowNumber + 1;
}

async function appendSheetRow(sheets, sheetId, rowCount) {
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: EVENT_SPREADSHEET_ID,
        requestBody: {
            requests: [{
                insertDimension: {
                    range: {
                        sheetId,
                        dimension: 'ROWS',
                        startIndex: rowCount,
                        endIndex: rowCount + 1
                    },
                    inheritFromBefore: true
                }
            }]
        }
    });
}

function getTodayInJapan() {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date()).replace(/-/g, '/');
}

async function writeEventRow(sheets, rowNumber, sequence, registrationDate, event, organizerName) {
    const updates = [
        { range: `'${EVENT_SHEET_NAME}'!C${rowNumber}`, values: [[sequence]] },
        { range: `'${EVENT_SHEET_NAME}'!D${rowNumber}:E${rowNumber}`, values: [[registrationDate, registrationDate]] },
        { range: `'${EVENT_SHEET_NAME}'!F${rowNumber}:I${rowNumber}`, values: [[event.eventDate, event.eventStart, event.eventEnd, event.category]] },
        { range: `'${EVENT_SHEET_NAME}'!K${rowNumber}:M${rowNumber}`, values: [[event.seriesName, event.source, event.eventName]] },
        { range: `'${EVENT_SHEET_NAME}'!P${rowNumber}`, values: [[organizerName]] },
        { range: `'${EVENT_SHEET_NAME}'!R${rowNumber}:S${rowNumber}`, values: [[event.prefecture, event.place]] },
        { range: `'${EVENT_SHEET_NAME}'!U${rowNumber}:X${rowNumber}`, values: [[event.surface, event.configuration, event.teamSizeMin, event.teamSizeMax]] },
        { range: `'${EVENT_SHEET_NAME}'!Y${rowNumber}:AE${rowNumber}`, values: [[event.rules, event.capacity, event.entryStart, event.entryEnd, event.entryMethod, event.entryFee, event.entryOther]] },
        { range: `'${EVENT_SHEET_NAME}'!AG${rowNumber}`, values: [[event.remarks]] },
        { range: `'${EVENT_SHEET_NAME}'!AK${rowNumber}`, values: [[event.image]] },
        { range: `'${EVENT_SHEET_NAME}'!AR${rowNumber}`, values: [[true]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: EVENT_SPREADSHEET_ID,
        requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates
        }
    });
}

async function sortEvents(sheets, sheetId, lastRowNumber) {
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: EVENT_SPREADSHEET_ID,
        requestBody: {
            requests: [{
                sortRange: {
                    range: {
                        sheetId,
                        startRowIndex: 1,
                        endRowIndex: lastRowNumber,
                        startColumnIndex: 0,
                        endColumnIndex: 44
                    },
                    sortSpecs: [{
                        dimensionIndex: 39,
                        sortOrder: 'ASCENDING'
                    }]
                }
            }]
        }
    });
}

async function runUploadAll(auth) {
    const script = google.script({ version: 'v1', auth });
    const response = await script.scripts.run({
        scriptId: APPS_SCRIPT_ID,
        requestBody: {
            function: 'uploadAll',
            devMode: false
        }
    });
    if (response.data.error) {
        const errorMessage = response.data.error.details?.[0]?.errorMessage
            || response.data.error.message
            || 'The Apps Script uploadAll function failed.';
        throw new Error(errorMessage);
    }
    if (!response.data.response) {
        throw new Error('The Apps Script uploadAll function returned no completed response.');
    }
}

async function sendDiscordNotification({ organizerName, eventName, eventDate, place, source, sequence }) {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: [
                '# 認証済み主催者からのイベント作成リクエストを受け付けました',
                '',
                `**主催者名：** ${organizerName}`,
                `**イベント名：** ${eventName}`,
                `**開始日：** ${eventDate}`,
                `**場所：** ${place || '未入力'}`,
                `**シーケンス：** ${sequence}`,
                `**ソース：** ${source}`,
                `**イベントページ：** http://jajapatatas.com/article/?serial=${encodeURIComponent(sequence)}`
            ].join('\n'),
            allowed_mentions: { parse: [] }
        }),
        signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) {
        throw new Error(`Discord webhook returned HTTP ${response.status}.`);
    }
}

function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
