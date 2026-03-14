/**
 * notification-server.js
 *
 * Sends a WhatsApp alert via Twilio when a patient's risk score exceeds 7.
 * Called by patient-vitals.html through the browser fetch API.
 *
 * Usage:
 *   TWILIO_ACCOUNT_SID=ACxxx \
 *   TWILIO_AUTH_TOKEN=xxx \
 *   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886 \
 *   NOTIFY_WHATSAPP_TO=whatsapp:+919XXXXXXXXX \
 *   node notification-server.js
 *
 * Or copy .env.example to .env and run with:
 *   node -r dotenv/config notification-server.js
 */

'use strict';

const http   = require('http');
const twilio = require('twilio');

const PORT             = Number(process.env.NOTIFY_PORT || 8788);
const ACCOUNT_SID      = process.env.TWILIO_ACCOUNT_SID  || '';
const AUTH_TOKEN       = process.env.TWILIO_AUTH_TOKEN    || '';
const FROM_NUMBER      = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const TO_NUMBER_RAW    = process.env.NOTIFY_WHATSAPP_TO   || '';
const RISK_THRESHOLD   = Number(process.env.RISK_THRESHOLD || 7);

// ── Startup checks ────────────────────────────────────────────────────────────

if (!ACCOUNT_SID || !AUTH_TOKEN) {
    console.error('[ERROR] TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set.');
    process.exit(1);
}

if (!TO_NUMBER_RAW) {
    console.error('[ERROR] NOTIFY_WHATSAPP_TO must be set (e.g. whatsapp:+919XXXXXXXXX).');
    process.exit(1);
}

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
const DEFAULT_RECIPIENTS = TO_NUMBER_RAW.split(',').map(s => s.trim()).filter(Boolean);

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
}

function collectBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
            if (raw.length > 64 * 1024) {
                reject(new Error('Payload too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            if (!raw) { resolve({}); return; }
            try { resolve(JSON.parse(raw)); }
            catch (err) { reject(new Error('Invalid JSON')); }
        });
        req.on('error', reject);
    });
}

function buildMessage(data) {
    const name    = String(data.patientName || 'Unknown patient');
    const score   = data.score ?? '—';
    const level   = data.level || 'High';
    const factors = Array.isArray(data.factors) && data.factors.length
        ? data.factors.join(', ')
        : 'Multiple risk factors detected';
    const ts      = data.ts || new Date().toLocaleString();

    return (
        `🚨 *MaternaWatch AI — HIGH RISK ALERT*\n\n` +
        `Patient: *${name}*\n` +
        `Risk Score: *${score}/10*\n` +
        `Risk Level: *${level}*\n` +
        `Factors: ${factors}\n` +
        `Recorded at: ${ts}\n\n` +
        `⚠️ Immediate medical review is recommended.`
    );
}

function getRecipients(body) {
    if (Array.isArray(body.toNumbers) && body.toNumbers.length) {
        return body.toNumbers.map(n => String(n).trim()).filter(Boolean);
    }
    return DEFAULT_RECIPIENTS;
}

// ── Server ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // Health check
    if (req.method === 'GET' && url.pathname === '/') {
        sendJson(res, 200, {
            ok: true,
            endpoint: `POST http://localhost:${PORT}/notify/whatsapp`,
            riskThreshold: RISK_THRESHOLD,
            recipients: DEFAULT_RECIPIENTS
        });
        return;
    }

    // WhatsApp notification
    if (req.method === 'POST' && url.pathname === '/notify/whatsapp') {
        try {
            const body = await collectBody(req);

            const score = Number(body.score ?? 0);
            if (score <= RISK_THRESHOLD) {
                sendJson(res, 200, { ok: true, sent: false, reason: `Score ${score} is not above threshold ${RISK_THRESHOLD}` });
                return;
            }

            const message = buildMessage(body);
            const recipients = getRecipients(body);
            if (!recipients.length) {
                sendJson(res, 400, { ok: false, error: 'No recipients configured.' });
                return;
            }

            const results = await Promise.allSettled(
                recipients.map(to =>
                    client.messages.create({ from: FROM_NUMBER, to, body: message })
                )
            );

            const sent = [];
            const failed = [];
            for (let i = 0; i < results.length; i++) {
                const out = results[i];
                const to = recipients[i];
                if (out.status === 'fulfilled') {
                    sent.push({ to, sid: out.value.sid });
                } else {
                    failed.push({ to, error: out.reason && out.reason.message ? out.reason.message : 'Unknown error' });
                }
            }

            console.log(
                `[${new Date().toISOString()}] WhatsApp send summary | Patient: ${body.patientName} | Score: ${score} | Sent: ${sent.length} | Failed: ${failed.length}`
            );

            sendJson(res, 200, {
                ok: true,
                sent: sent.length > 0,
                sentCount: sent.length,
                failedCount: failed.length,
                sent,
                failed
            });

        } catch (err) {
            console.error(`[${new Date().toISOString()}] WhatsApp send failed:`, err.message);
            sendJson(res, 500, { ok: false, error: err.message });
        }
        return;
    }

    sendJson(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
    console.log(`Notification server running on http://localhost:${PORT}`);
    console.log(`Alerts will be sent to: ${DEFAULT_RECIPIENTS.join(', ')}`);
    console.log(`Risk threshold: score > ${RISK_THRESHOLD}`);
});
