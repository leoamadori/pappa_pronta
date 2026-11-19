import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_INT32_SEC,
  SYNC_STATUS,
  serializeWatchState,
  parseWatchState,
  computeWatchDisplayModel
} from './contract.js';

test('serializeWatchState and parseWatchState round-trip all 14 tokens within 32-bit bounds', () => {
  const raw = {
    status: SYNC_STATUS.OK,
    dateYmd: 20261119,
    fastMode: 'fasting',
    protoFastH: 16,
    protoEatH: 8,
    anchorSec: 1795032000,
    targetSec: 1795089600,
    lastMealSec: 1795032000,
    foodDozen: 15,
    exerciseLogged: 1,
    cloudSteps: 8120,
    updatedAtSec: 1795032100,
    syncedAtSec: 1795032105
  };
  const str = serializeWatchState(raw);
  assert.equal(str.split('|').length, 14);
  const parsed = parseWatchState(str);
  assert.deepEqual(parsed, { v: 1, ...raw });

  const clamped = parseWatchState(serializeWatchState({ ...raw, anchorSec: 9999999999999 }));
  assert.equal(clamped.anchorSec, MAX_INT32_SEC);
});

test('empty or corrupt SysPro string after watch reboot renders --/24 and Tocca prompt', () => {
  assert.equal(parseWatchState(''), null);
  assert.equal(parseWatchState('2|0|20261119|fasting|16|8|1|2|3|4|0|0|1|1'), null);

  const vm = computeWatchDisplayModel(null, 20261119, 1795060800, 1200, 620);
  assert.equal(vm.isSynced, false);
  assert.equal(vm.dozenText, '--/24');
  assert.equal(vm.fastPrimary, '--:--');
  assert.equal(vm.goalMet, false); // 620 BMR kcal must NOT trigger goalMet!
});

test('midnight rollover resets foodDozen, exerciseLogged, and cloudSteps to 0 while keeping fasting timer ticking', () => {
  const yesterdaySync = parseWatchState(serializeWatchState({
    status: SYNC_STATUS.OK,
    dateYmd: 20261118,
    fastMode: 'fasting',
    protoFastH: 16,
    protoEatH: 8,
    anchorSec: 1795028400, // 20:00 yesterday
    targetSec: 1795086000, // 12:00 today
    lastMealSec: 1795028400,
    foodDozen: 19,
    exerciseLogged: 1,
    cloudSteps: 9400,
    updatedAtSec: 1795028500,
    syncedAtSec: 1795028505
  }));

  // 07:00 next morning (11h into fast), 250 steps, 480 BMR kcal
  const vm = computeWatchDisplayModel(yesterdaySync, 20261119, 1795028400 + 11 * 3600, 250, 480);
  assert.equal(vm.stepsEffective, 250); // yesterday's 9400 cloudSteps zeroed!
  assert.equal(vm.goalMet, false);      // yesterday's exerciseLogged zeroed & 480 BMR ignored!
  assert.equal(vm.dozenText, '0/24');   // yesterday's 19/24 zeroed!
  assert.equal(vm.fastStateKind, 'fasting');
  assert.equal(vm.fastPrimary, '11h 00m');
  assert.equal(vm.fastSecondary, 'mancano 5h 00m');
});

test('autonomous overnight eating -> fasting -> done transitions use lastMealSec without phone sync', () => {
  // User ate lunch at 12:30, dinner at 19:00, synced at 19:05 while 8h window ends at 20:30
  const lunchSec = 1795001400;
  const dinnerSec = lunchSec + Math.round(6.5 * 3600); // 19:00
  const windowEndSec = lunchSec + 8 * 3600;            // 20:30

  const state = parseWatchState(serializeWatchState({
    status: SYNC_STATUS.OK,
    dateYmd: 20261118,
    fastMode: 'eating',
    protoFastH: 16,
    protoEatH: 8,
    anchorSec: lunchSec,
    targetSec: windowEndSec,
    lastMealSec: dinnerSec,
    foodDozen: 16,
    exerciseLogged: 0,
    cloudSteps: 5000,
    updatedAtSec: dinnerSec + 300,
    syncedAtSec: dinnerSec + 305
  }));

  // At 22:00 (past 20:30 windowEndSec, 3h after 19:00 dinnerSec): transitions to fasting anchored at 19:00!
  const vmNight = computeWatchDisplayModel(state, 20261118, dinnerSec + 3 * 3600, 5200, 1900);
  assert.equal(vmNight.fastStateKind, 'fasting');
  assert.equal(vmNight.fastPrimary, '3h 00m');
  assert.equal(vmNight.fastSecondary, 'mancano 13h 00m');

  // At 11:30 next day (16h 30m after 19:00 dinnerSec): transitions to done!
  const vmDone = computeWatchDisplayModel(state, 20261119, dinnerSec + Math.round(16.5 * 3600), 3000, 900);
  assert.equal(vmDone.fastStateKind, 'done');
  assert.equal(vmDone.fastPrimary, '16h 30m');
  assert.equal(vmDone.fastPct, 100);
});

test('watch swap reconciles max(sensorSteps, cloudSteps) and never double-counts the 24th exercise portion', () => {
  const synced = parseWatchState(serializeWatchState({
    status: SYNC_STATUS.OK,
    dateYmd: 20261119,
    fastMode: 'eating',
    protoFastH: 16,
    protoEatH: 8,
    anchorSec: 1795087200,
    targetSec: 1795116000,
    lastMealSec: 1795087200,
    foodDozen: 23,
    exerciseLogged: 1,
    cloudSteps: 8200,
    updatedAtSec: 1795087300,
    syncedAtSec: 1795087305
  }));

  // Newly worn watch has only 400 local steps, then later crosses 9000 steps while exerciseLogged === 1
  const vmSwap = computeWatchDisplayModel(synced, 20261119, 1795090800, 400, 700);
  assert.equal(vmSwap.stepsEffective, 8200);
  assert.equal(vmSwap.goalMet, true);
  assert.equal(vmSwap.dozenText, '24/24');

  const vmBothHit = computeWatchDisplayModel(synced, 20261119, 1795090800, 9100, 2100);
  assert.equal(vmBothHit.stepsEffective, 9100);
  assert.equal(vmBothHit.displayedDozen, 24);
  assert.equal(vmBothHit.dozenText, '24/24');
});
