import { google } from 'googleapis';

const MASTER_SPREADSHEET_ID = process.env.MASTER_SPREADSHEET_ID;
const MASTER_SHEET_NAME = '主催マスタ';
const ALLOWED_ORIGINS = new Set([
    'https://www.jajapatatas.com',
    'http://127.0.0.1:8080',
    'http://localhost:8080'
]);

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
    try {
        validateConfiguration();
        const secretKey = validateRequestBody(req.body);
        const auth = createGoogleAuth();

        phase = '認証ID照合';
        const organizer = await findOrganizer(auth, secretKey);
        res.status(200).send({ success: true, organizer });
    } catch (error) {
        console.error('認証IDの確認に失敗しました。', {
            phase,
            message: error instanceof Error ? error.message : String(error)
        });
        const statusCode = error instanceof RequestError ? error.statusCode : 500;
        const message = error instanceof RequestError
            ? error.message
            : 'サーバー内部でエラーが発生しました。時間をおいて再度お試しください。';
        res.status(statusCode).send({ error: message });
    }
}

function validateConfiguration() {
    const requiredVariables = [
        'MASTER_SPREADSHEET_ID',
        'GOOGLE_OAUTH_CLIENT_ID',
        'GOOGLE_OAUTH_CLIENT_SECRET',
        'GOOGLE_OAUTH_REFRESH_TOKEN'
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
    return secretKey;
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

    const id = String(matches[0][0] ?? '').trim();
    const name = String(matches[0][4] ?? '').trim();
    if (!id || !name) {
        throw new Error('The matched organizer is missing its ID or display name.');
    }
    return { id, name };
}
