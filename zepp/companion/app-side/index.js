import { MessageBuilder } from '../shared/message';
import {
  SETTINGS_KEYS,
  SYNC_STATUS,
  STATUS_MESSAGES_IT,
  serializeWatchState,
  formatClockHHMM
} from '../shared/contract';

const messageBuilder = new MessageBuilder();

function parseSafeJson(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function readIntField(fields, key, fallback) {
  const f = fields && fields[key];
  if (!f) return fallback;
  if (f.integerValue !== undefined) return Math.trunc(Number(f.integerValue) || fallback);
  if (f.doubleValue !== undefined) return Math.trunc(Number(f.doubleValue) || fallback);
  return fallback;
}

function readStringField(fields, key, fallback) {
  const f = fields && fields[key];
  if (!f || typeof f.stringValue !== 'string') return fallback;
  return f.stringValue;
}

function writeDiagnostic(statusCode, detail) {
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    settings.settingsStorage.setItem(
      SETTINGS_KEYS.LAST_DIAG_JSON,
      JSON.stringify({
        status: statusCode,
        time: formatClockHHMM(nowSec),
        msg: detail || STATUS_MESSAGES_IT[statusCode] || String(statusCode)
      })
    );
  } catch (_) {}
}

async function sideHttpRequest(opts) {
  const res = await fetch({
    url: opts.url,
    method: opts.method || 'GET',
    headers: opts.headers || {},
    body: opts.body
  });
  const status = Number(res && res.status) || 0;
  let bodyObj = null;
  if (res && res.body !== undefined) {
    bodyObj = typeof res.body === 'string' ? parseSafeJson(res.body) : res.body;
  }
  return { status, body: bodyObj };
}

async function getValidFirebaseIdToken(pairing) {
  const nowSec = Math.floor(Date.now() / 1000);
  const cachedToken = settings.settingsStorage.getItem(SETTINGS_KEYS.CACHED_ID_TOKEN);
  const cachedExpSec = Number(settings.settingsStorage.getItem(SETTINGS_KEYS.CACHED_TOKEN_EXP_SEC) || 0);

  if (cachedToken && cachedExpSec - 300 > nowSec) {
    return { ok: true, idToken: cachedToken };
  }

  const formBody =
    'grant_type=refresh_token&refresh_token=' + encodeURIComponent(pairing.refreshToken);
  const tokenRes = await sideHttpRequest({
    url: 'https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(pairing.apiKey),
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody
  });

  if (tokenRes.status === 400 || tokenRes.status === 401 || tokenRes.status === 403) {
    settings.settingsStorage.removeItem(SETTINGS_KEYS.CACHED_ID_TOKEN);
    settings.settingsStorage.removeItem(SETTINGS_KEYS.CACHED_TOKEN_EXP_SEC);
    return { ok: false, status: SYNC_STATUS.AUTH_EXPIRED, detail: 'Token HTTP ' + tokenRes.status };
  }

  if (tokenRes.status < 200 || tokenRes.status >= 300 || !tokenRes.body || !tokenRes.body.id_token) {
    return { ok: false, status: SYNC_STATUS.HTTP_ERR, detail: 'Token HTTP ' + tokenRes.status };
  }

  const idToken = String(tokenRes.body.id_token);
  const expiresIn = Math.max(60, Number(tokenRes.body.expires_in) || 3600);
  settings.settingsStorage.setItem(SETTINGS_KEYS.CACHED_ID_TOKEN, idToken);
  settings.settingsStorage.setItem(SETTINGS_KEYS.CACHED_TOKEN_EXP_SEC, String(nowSec + expiresIn));

  if (tokenRes.body.refresh_token && tokenRes.body.refresh_token !== pairing.refreshToken) {
    pairing.refreshToken = String(tokenRes.body.refresh_token);
    settings.settingsStorage.setItem(SETTINGS_KEYS.PAIRING_JSON, JSON.stringify(pairing));
  }

  return { ok: true, idToken };
}

async function handleSyncWatchRequest(ctx) {
  try {
    const rawPairing = settings.settingsStorage.getItem(SETTINGS_KEYS.PAIRING_JSON);
    const pairing = parseSafeJson(rawPairing);
    if (!pairing || !pairing.projectId || !pairing.apiKey || !pairing.uid || !pairing.refreshToken) {
      writeDiagnostic(SYNC_STATUS.UNCONFIGURED, STATUS_MESSAGES_IT[SYNC_STATUS.UNCONFIGURED]);
      ctx.response({ data: { status: SYNC_STATUS.UNCONFIGURED, serialized: '' } });
      return;
    }

    const authResult = await getValidFirebaseIdToken(pairing);
    if (!authResult.ok) {
      writeDiagnostic(authResult.status, authResult.detail);
      ctx.response({ data: { status: authResult.status, serialized: '' } });
      return;
    }

    const docUrl =
      'https://firestore.googleapis.com/v1/projects/' +
      encodeURIComponent(pairing.projectId) +
      '/databases/(default)/documents/users/' +
      encodeURIComponent(pairing.uid) +
      '/integrations/watch';

    const docRes = await sideHttpRequest({
      url: docUrl,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + authResult.idToken
      }
    });

    if (docRes.status === 404) {
      writeDiagnostic(SYNC_STATUS.NOT_FOUND, 'Documento watch non ancora presente (404)');
      ctx.response({ data: { status: SYNC_STATUS.NOT_FOUND, serialized: '' } });
      return;
    }

    if (docRes.status === 401 || docRes.status === 403) {
      settings.settingsStorage.removeItem(SETTINGS_KEYS.CACHED_ID_TOKEN);
      settings.settingsStorage.removeItem(SETTINGS_KEYS.CACHED_TOKEN_EXP_SEC);
      writeDiagnostic(SYNC_STATUS.AUTH_EXPIRED, 'Firestore HTTP ' + docRes.status);
      ctx.response({ data: { status: SYNC_STATUS.AUTH_EXPIRED, serialized: '' } });
      return;
    }

    if (docRes.status < 200 || docRes.status >= 300 || !docRes.body || !docRes.body.fields) {
      writeDiagnostic(SYNC_STATUS.HTTP_ERR, 'Firestore HTTP ' + docRes.status);
      ctx.response({ data: { status: SYNC_STATUS.HTTP_ERR, serialized: '' } });
      return;
    }

    const f = docRes.body.fields;
    const nowSec = Math.floor(Date.now() / 1000);
    const serialized = serializeWatchState({
      status: SYNC_STATUS.OK,
      dateYmd: readIntField(f, 'dateYmd', 20260101),
      fastMode: readStringField(f, 'fastMode', 'off'),
      protoFastH: readIntField(f, 'protoFastH', 0),
      protoEatH: readIntField(f, 'protoEatH', 0),
      anchorSec: readIntField(f, 'anchorSec', 0),
      targetSec: readIntField(f, 'targetSec', 0),
      lastMealSec: readIntField(f, 'lastMealSec', 0),
      foodDozen: readIntField(f, 'foodDozen', 0),
      exerciseLogged: readIntField(f, 'exerciseLogged', 0),
      cloudSteps: readIntField(f, 'cloudSteps', 0),
      updatedAtSec: readIntField(f, 'updatedAtSec', nowSec),
      syncedAtSec: nowSec
    });

    writeDiagnostic(SYNC_STATUS.OK, 'OK · ' + readIntField(f, 'foodDozen', 0) + ' porzioni cibo');
    ctx.response({
      data: {
        status: SYNC_STATUS.OK,
        serialized
      }
    });
  } catch (err) {
    writeDiagnostic(SYNC_STATUS.HTTP_ERR, 'Eccezione: ' + String((err && err.message) || err));
    ctx.response({
      data: {
        status: SYNC_STATUS.HTTP_ERR,
        serialized: ''
      }
    });
  }
}

AppSideService({
  onInit() {
    messageBuilder.listen(() => {});
    messageBuilder.on('request', (ctx) => {
      const req = messageBuilder.buf2Json(ctx.request.payload);
      if (req && req.method === 'SYNC_WATCH') {
        handleSyncWatchRequest(ctx);
      }
    });
  },
  onRun() {},
  onDestroy() {}
});
