/**
 * Shared Data Contract & Pure Display Calculator for Pappa Pronta Zepp OS
 * Compatible with Zepp OS 1.0 (GTS 4 Mini) and Zepp OS 4.2+ (Active 2 Round).
 */

export const COMPANION_APP_ID = 1058201;
export const WATCHFACE_APP_ID = 1058202;
export const SYSPRO_KEY = 'pp_wf_v1';
export const SCHEMA_VERSION = 1;
export const STEP_GOAL = 7500;
export const MAX_INT32_SEC = 2147483647;

export const SYNC_STATUS = {
  OK: 0,
  NO_BLE: 1,
  AUTH_EXPIRED: 2,
  HTTP_ERR: 3,
  NOT_FOUND: 4,
  UNCONFIGURED: 5
};

export const SETTINGS_KEYS = {
  PAIRING_JSON: 'pp_pairing_v1',
  CACHED_ID_TOKEN: 'pp_id_token_v1',
  CACHED_TOKEN_EXP_SEC: 'pp_token_exp_sec_v1',
  LAST_DIAG_JSON: 'pp_last_diag_v1'
};

export const STATUS_MESSAGES_IT = {
  0: 'Sincronizzato',
  1: 'Telefono non connesso via Bluetooth',
  2: 'Sessione scaduta: ricollega in App Zepp',
  3: 'Errore rete o Cloud Firestore',
  4: 'Salva prima un pasto su Pappa Pronta',
  5: 'Incolla il codice in App Zepp > Impostazioni'
};

const VALID_MODES = ['fasting', 'eating', 'done', 'off'];

function clampInt(val, minVal, maxVal, fallback) {
  const n = Math.trunc(Number(val));
  if (!Number.isFinite(n)) return fallback;
  if (n < minVal) return minVal;
  if (n > maxVal) return maxVal;
  return n;
}

export function formatDurationSec(totalSec) {
  const sec = Math.max(0, Math.trunc(Number(totalSec) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const mm = m < 10 ? '0' + m : String(m);
  return h + 'h ' + mm + 'm';
}

export function formatClockHHMM(epochSec) {
  const sec = clampInt(epochSec, 0, MAX_INT32_SEC, 0);
  if (sec <= 0) return '--:--';
  const d = new Date(sec * 1000);
  const hh = d.getHours();
  const mm = d.getMinutes();
  return (hh < 10 ? '0' + hh : String(hh)) + ':' + (mm < 10 ? '0' + mm : String(mm));
}

export function serializeWatchState(raw) {
  const obj = raw || {};
  const mode = VALID_MODES.indexOf(obj.fastMode) >= 0 ? obj.fastMode : 'off';
  const parts = [
    SCHEMA_VERSION,
    clampInt(obj.status, 0, 5, SYNC_STATUS.OK),
    clampInt(obj.dateYmd, 20200101, 20991231, 20260101),
    mode,
    clampInt(obj.protoFastH, 0, 24, 0),
    clampInt(obj.protoEatH, 0, 24, 0),
    clampInt(obj.anchorSec, 0, MAX_INT32_SEC, 0),
    clampInt(obj.targetSec, 0, MAX_INT32_SEC, 0),
    clampInt(obj.lastMealSec, 0, MAX_INT32_SEC, 0),
    clampInt(obj.foodDozen, 0, 23, 0),
    clampInt(obj.exerciseLogged, 0, 1, 0),
    clampInt(obj.cloudSteps, 0, 200000, 0),
    clampInt(obj.updatedAtSec, 0, MAX_INT32_SEC, 0),
    clampInt(obj.syncedAtSec, 0, MAX_INT32_SEC, 0)
  ];
  return parts.join('|');
}

export function parseWatchState(serialized) {
  if (typeof serialized !== 'string' || !serialized) return null;
  const parts = serialized.split('|');
  if (parts.length !== 14) return null;
  const v = clampInt(parts[0], 0, 99, 0);
  if (v !== SCHEMA_VERSION) return null;
  const fastMode = parts[3];
  if (VALID_MODES.indexOf(fastMode) < 0) return null;

  return {
    v,
    status: clampInt(parts[1], 0, 5, SYNC_STATUS.HTTP_ERR),
    dateYmd: clampInt(parts[2], 20200101, 20991231, 0),
    fastMode,
    protoFastH: clampInt(parts[4], 0, 24, 0),
    protoEatH: clampInt(parts[5], 0, 24, 0),
    anchorSec: clampInt(parts[6], 0, MAX_INT32_SEC, 0),
    targetSec: clampInt(parts[7], 0, MAX_INT32_SEC, 0),
    lastMealSec: clampInt(parts[8], 0, MAX_INT32_SEC, 0),
    foodDozen: clampInt(parts[9], 0, 23, 0),
    exerciseLogged: clampInt(parts[10], 0, 1, 0),
    cloudSteps: clampInt(parts[11], 0, 200000, 0),
    updatedAtSec: clampInt(parts[12], 0, MAX_INT32_SEC, 0),
    syncedAtSec: clampInt(parts[13], 0, MAX_INT32_SEC, 0)
  };
}

export function computeWatchDisplayModel(parsed, localTodayYmd, nowSec, sensorSteps, sensorCalorie) {
  const safeSensorSteps = clampInt(sensorSteps, 0, 200000, 0);
  const safeSensorKcal = clampInt(sensorCalorie, 0, 99999, 0);
  const safeNowSec = clampInt(nowSec, 0, MAX_INT32_SEC, 0);
  const safeTodayYmd = clampInt(localTodayYmd, 20200101, 20991231, 20260101);

  if (!parsed || parsed.syncedAtSec <= 0) {
    const localGoalMet = safeSensorSteps >= STEP_GOAL;
    return {
      isSynced: false,
      isStale: true,
      fastStateKind: 'unsynced',
      fastTitle: 'DIGIUNO',
      fastPrimary: '--:--',
      fastSecondary: 'Tocca ↻ per collegare',
      fastPct: 0,
      aodFastTag: 'SYNC --',
      stepsEffective: safeSensorSteps,
      sensorKcal: safeSensorKcal,
      goalMet: localGoalMet,
      displayedDozen: localGoalMet ? 1 : 0,
      dozenText: '--/24',
      syncText: '↻ Collega'
    };
  }

  const isSameDay = parsed.dateYmd === safeTodayYmd;
  const effectiveFoodDozen = isSameDay ? parsed.foodDozen : 0;
  const effectiveExerciseLogged = isSameDay ? parsed.exerciseLogged : 0;
  const effectiveCloudSteps = isSameDay ? parsed.cloudSteps : 0;

  const stepsEffective = Math.max(safeSensorSteps, effectiveCloudSteps);
  // Intentional exclusion of raw sensorCalorie from >= 300 goal check (includes resting BMR)
  const goalMet = stepsEffective >= STEP_GOAL || effectiveExerciseLogged === 1;
  const displayedDozen = Math.min(24, effectiveFoodDozen + (goalMet ? 1 : 0));

  let effMode = parsed.fastMode;
  let effAnchorSec = parsed.anchorSec;
  let effTargetSec = parsed.targetSec;

  // Autonomous local transition when eating window expires overnight without phone sync
  if (effMode === 'eating' && effTargetSec > 0 && safeNowSec >= effTargetSec) {
    if (parsed.protoFastH > 0) {
      effMode = 'fasting';
      effAnchorSec = parsed.lastMealSec > 0 ? parsed.lastMealSec : effTargetSec;
      effTargetSec = effAnchorSec + parsed.protoFastH * 3600;
    } else {
      effMode = 'off';
    }
  }

  let fastStateKind = 'off';
  let fastTitle = 'DIGIUNO LIBERO';
  let fastPrimary = 'Libero';
  let fastSecondary = 'Nessun vincolo';
  let fastPct = 0;
  let aodFastTag = 'LIBERO';

  if (effMode === 'eating' && effAnchorSec > 0 && effTargetSec > safeNowSec) {
    const remSec = Math.max(0, effTargetSec - safeNowSec);
    const totalEatSec = Math.max(1, (parsed.protoEatH || 8) * 3600);
    const elapsedEatSec = Math.max(0, safeNowSec - effAnchorSec);
    fastStateKind = 'eating';
    fastTitle = 'FINESTRA ' + parsed.protoEatH + 'H';
    fastPrimary = formatDurationSec(remSec);
    fastSecondary = 'chiude ' + formatClockHHMM(effTargetSec);
    fastPct = clampInt(Math.round((elapsedEatSec / totalEatSec) * 100), 0, 100, 0);
    aodFastTag = 'PASTI ' + formatDurationSec(remSec);
  } else if ((effMode === 'fasting' || effMode === 'done') && effAnchorSec > 0) {
    const elapsedSec = Math.max(0, safeNowSec - effAnchorSec);
    const totalFastSec = Math.max(1, (parsed.protoFastH || 16) * 3600);
    const resolvedTarget = effTargetSec > 0 ? effTargetSec : (effAnchorSec + totalFastSec);
    const reached = effMode === 'done' || (parsed.protoFastH > 0 && safeNowSec >= resolvedTarget);

    if (reached) {
      fastStateKind = 'done';
      fastTitle = 'TARGET ' + parsed.protoFastH + 'H OK';
      fastPrimary = formatDurationSec(elapsedSec);
      fastSecondary = 'obiettivo raggiunto';
      fastPct = 100;
      aodFastTag = 'OK ' + formatDurationSec(elapsedSec);
    } else {
      const remFastSec = Math.max(0, resolvedTarget - safeNowSec);
      fastStateKind = 'fasting';
      fastTitle = 'DIGIUNO ' + parsed.protoFastH + 'H';
      fastPrimary = formatDurationSec(elapsedSec);
      fastSecondary = 'mancano ' + formatDurationSec(remFastSec);
      fastPct = clampInt(Math.round((elapsedSec / totalFastSec) * 100), 0, 100, 0);
      aodFastTag = 'DIG ' + formatDurationSec(elapsedSec);
    }
  }

  const syncAgeSec = Math.max(0, safeNowSec - parsed.syncedAtSec);
  const isStale = parsed.status !== SYNC_STATUS.OK || !isSameDay || syncAgeSec > 14400;
  const syncText = '↻ ' + formatClockHHMM(parsed.syncedAtSec);

  return {
    isSynced: true,
    isStale,
    fastStateKind,
    fastTitle,
    fastPrimary,
    fastSecondary,
    fastPct,
    aodFastTag,
    stepsEffective,
    sensorKcal: safeSensorKcal,
    goalMet,
    displayedDozen,
    dozenText: displayedDozen + '/24',
    syncText
  };
}
