import {
  COMPANION_APP_ID,
  SYSPRO_KEY,
  parseWatchState,
  computeWatchDisplayModel
} from '../shared/contract';
import { PALETTE, selectLayoutForDevice } from './layouts';

const WEEKDAYS_IT = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];

function pad2(n) {
  const v = Math.max(0, Math.trunc(Number(n) || 0));
  return v < 10 ? '0' + v : String(v);
}

WatchFace({
  onInit() {
    this.widgets = {};
    this.sensors = {};
    this.minuteListener = null;
    this.layout = selectLayoutForDevice();
  },

  readHardwareSnapshot() {
    const t = this.sensors.time;
    const year = (t && t.year) || 2026;
    const month = (t && t.month) || 1;
    const day = (t && t.day) || 1;
    const hour = (t && t.hour) || 0;
    const minute = (t && t.minute) || 0;
    const week = (t && t.week) || 1; // Zepp TIME.week: 1=Mon..7=Sun
    const utcMs = (t && t.utc) ? Number(t.utc) : Date.now();
    const nowSec = Math.floor(utcMs / 1000);
    const todayYmd = year * 10000 + month * 100 + day;

    const steps = this.sensors.step ? Number(this.sensors.step.current || 0) : 0;
    const kcal = this.sensors.calorie ? Number(this.sensors.calorie.current || 0) : 0;
    const batt = this.sensors.battery ? Number(this.sensors.battery.current || 0) : 0;
    const bleOk = (typeof hmBle !== 'undefined' && hmBle.connectStatus) ? Boolean(hmBle.connectStatus()) : true;

    const wdIdx = week >= 1 && week <= 7 ? (week % 7) : 0;
    const dateLine =
      WEEKDAYS_IT[wdIdx] + ' ' + pad2(day) + '/' + pad2(month) + ' · ' + batt + '%' + (bleOk ? '' : ' · BT OFF');

    return {
      todayYmd,
      nowSec,
      clockStr: pad2(hour) + ':' + pad2(minute),
      dateLine,
      steps,
      kcal
    };
  },

  pickFastColor(kind) {
    if (kind === 'done') return PALETTE.PRIMARY_GREEN;
    if (kind === 'eating') return PALETTE.ACCENT_AMBER;
    if (kind === 'fasting') return PALETTE.ACCENT_BLUE;
    return PALETTE.TEXT_MUTED;
  },

  refreshAll() {
    if (!this.widgets.clock) return;
    const L = this.layout;
    const hw = this.readHardwareSnapshot();

    let rawSysPro = '';
    try {
      const readVal = hmFS.SysProGetChars(SYSPRO_KEY);
      if (typeof readVal === 'string') rawSysPro = readVal;
    } catch (_) {}

    const parsed = parseWatchState(rawSysPro);
    const vm = computeWatchDisplayModel(parsed, hw.todayYmd, hw.nowSec, hw.steps, hw.kcal);
    const fastColor = this.pickFastColor(vm.fastStateKind);

    this.widgets.dateStatus.setProperty(hmUI.prop.TEXT, hw.dateLine);
    this.widgets.clock.setProperty(hmUI.prop.TEXT, hw.clockStr);

    this.widgets.fastTitle.setProperty(hmUI.prop.MORE, {
      text: vm.fastTitle,
      color: fastColor
    });
    this.widgets.fastPrimary.setProperty(hmUI.prop.MORE, {
      text: vm.fastPrimary,
      color: PALETTE.TEXT_MAIN
    });

    const fillW = Math.max(4, Math.round((L.fastBarTrack.w * vm.fastPct) / 100));
    this.widgets.fastBarFill.setProperty(hmUI.prop.MORE, {
      x: L.fastBarTrack.x,
      y: L.fastBarTrack.y,
      w: vm.fastPct > 0 ? fillW : 4,
      h: L.fastBarTrack.h,
      color: vm.fastPct > 0 ? fastColor : PALETTE.BAR_TRACK
    });

    this.widgets.fastSecondary.setProperty(hmUI.prop.TEXT, vm.fastSecondary);

    this.widgets.moveSteps.setProperty(hmUI.prop.MORE, {
      text: String(vm.stepsEffective),
      color: vm.goalMet ? PALETTE.PRIMARY_GREEN : PALETTE.TEXT_MAIN
    });
    this.widgets.moveKcal.setProperty(hmUI.prop.TEXT, vm.sensorKcal + ' kcal');
    this.widgets.moveGoalTag.setProperty(hmUI.prop.MORE, {
      text: vm.goalMet ? '7.5k OK ✓' : 'su 7.500',
      color: vm.goalMet ? PALETTE.PRIMARY_GREEN : PALETTE.TEXT_MUTED
    });

    this.widgets.dozenValue.setProperty(hmUI.prop.MORE, {
      text: vm.dozenText,
      color: vm.displayedDozen >= 18 && vm.isSynced ? PALETTE.PRIMARY_GREEN : PALETTE.TEXT_MAIN
    });

    this.widgets.syncBtn.setProperty(hmUI.prop.MORE, {
      x: L.syncBtn.x,
      y: L.syncBtn.y,
      w: L.syncBtn.w,
      h: L.syncBtn.h,
      text: vm.syncText,
      normal_color: vm.isStale ? 0x3b2f13 : PALETTE.BRAND_DARK_GREEN,
      press_color: 0x145336,
      color: vm.isStale ? PALETTE.ACCENT_AMBER : PALETTE.TEXT_MAIN
    });

    // Update minimal Always-On Display (< 10% lit pixels on #000000)
    this.widgets.aodClock.setProperty(hmUI.prop.TEXT, hw.clockStr);
    this.widgets.aodTag.setProperty(hmUI.prop.TEXT, vm.aodFastTag);
  },

  build() {
    const L = this.layout;
    const NORMAL = hmUI.show_level.ONLY_NORMAL;
    const AOD = hmUI.show_level.ONLY_AOD;

    this.sensors.time = hmSensor.createSensor(hmSensor.id.TIME);
    this.sensors.step = hmSensor.createSensor(hmSensor.id.STEP);
    this.sensors.calorie = hmSensor.createSensor(hmSensor.id.CALORIE);
    this.sensors.battery = hmSensor.createSensor(hmSensor.id.BATTERY);

    // Pure black background for both Normal and AOD
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: L.width,
      h: L.height,
      color: PALETTE.BG,
      show_level: NORMAL | AOD
    });

    // Top row: Date + Battery + BLE
    this.widgets.dateStatus = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.dateStatus.x,
      y: L.dateStatus.y,
      w: L.dateStatus.w,
      h: L.dateStatus.h,
      text_size: L.dateStatus.size,
      color: PALETTE.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: '',
      show_level: NORMAL
    });

    // Digital Clock
    this.widgets.clock = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.clock.x,
      y: L.clock.y,
      w: L.clock.w,
      h: L.clock.h,
      text_size: L.clock.size,
      color: PALETTE.TEXT_MAIN,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: '00:00',
      show_level: NORMAL
    });

    // Zone 1: Intermittent Fasting Card
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: L.fastCard.x,
      y: L.fastCard.y,
      w: L.fastCard.w,
      h: L.fastCard.h,
      radius: L.fastCard.r,
      color: PALETTE.CARD_BG,
      show_level: NORMAL
    });

    this.widgets.fastTitle = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.fastTitle.x,
      y: L.fastTitle.y,
      w: L.fastTitle.w,
      h: L.fastTitle.h,
      text_size: L.fastTitle.size,
      color: PALETTE.ACCENT_BLUE,
      align_h: hmUI.align.LEFT,
      align_v: hmUI.align.CENTER_V,
      text: 'DIGIUNO',
      show_level: NORMAL
    });

    this.widgets.fastPrimary = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.fastPrimary.x,
      y: L.fastPrimary.y,
      w: L.fastPrimary.w,
      h: L.fastPrimary.h,
      text_size: L.fastPrimary.size,
      color: PALETTE.TEXT_MAIN,
      align_h: hmUI.align.RIGHT,
      align_v: hmUI.align.CENTER_V,
      text: '--:--',
      show_level: NORMAL
    });

    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: L.fastBarTrack.x,
      y: L.fastBarTrack.y,
      w: L.fastBarTrack.w,
      h: L.fastBarTrack.h,
      radius: L.fastBarTrack.r,
      color: PALETTE.BAR_TRACK,
      show_level: NORMAL
    });

    this.widgets.fastBarFill = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: L.fastBarTrack.x,
      y: L.fastBarTrack.y,
      w: 4,
      h: L.fastBarTrack.h,
      radius: L.fastBarTrack.r,
      color: PALETTE.BAR_TRACK,
      show_level: NORMAL
    });

    this.widgets.fastSecondary = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.fastSecondary.x,
      y: L.fastSecondary.y,
      w: L.fastSecondary.w,
      h: L.fastSecondary.h,
      text_size: L.fastSecondary.size,
      color: PALETTE.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: 'Tocca ↻ per collegare',
      show_level: NORMAL
    });

    // Zone 2: Movement Card (Steps + Calories + Goal Badge)
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: L.moveCard.x,
      y: L.moveCard.y,
      w: L.moveCard.w,
      h: L.moveCard.h,
      radius: L.moveCard.r,
      color: PALETTE.CARD_BG,
      show_level: NORMAL
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.moveTitle.x,
      y: L.moveTitle.y,
      w: L.moveTitle.w,
      h: L.moveTitle.h,
      text_size: L.moveTitle.size,
      color: PALETTE.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: 'PASSI',
      show_level: NORMAL
    });

    this.widgets.moveSteps = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.moveSteps.x,
      y: L.moveSteps.y,
      w: L.moveSteps.w,
      h: L.moveSteps.h,
      text_size: L.moveSteps.size,
      color: PALETTE.TEXT_MAIN,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: '0',
      show_level: NORMAL
    });

    this.widgets.moveKcal = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.moveKcal.x,
      y: L.moveKcal.y,
      w: L.moveKcal.w,
      h: L.moveKcal.h,
      text_size: L.moveKcal.size,
      color: PALETTE.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: '0 kcal',
      show_level: NORMAL
    });

    this.widgets.moveGoalTag = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.moveGoalTag.x,
      y: L.moveGoalTag.y,
      w: L.moveGoalTag.w,
      h: L.moveGoalTag.h,
      text_size: L.moveGoalTag.size,
      color: PALETTE.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: 'su 7.500',
      show_level: NORMAL
    });

    // Zone 3: Healthy Foods (Daily Dozen X/24) + Circumscribed Refresh Button
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: L.dozenCard.x,
      y: L.dozenCard.y,
      w: L.dozenCard.w,
      h: L.dozenCard.h,
      radius: L.dozenCard.r,
      color: PALETTE.CARD_BG,
      show_level: NORMAL
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.dozenTitle.x,
      y: L.dozenTitle.y,
      w: L.dozenTitle.w,
      h: L.dozenTitle.h,
      text_size: L.dozenTitle.size,
      color: PALETTE.TEXT_MUTED,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: 'CIBI SANI',
      show_level: NORMAL
    });

    this.widgets.dozenValue = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.dozenValue.x,
      y: L.dozenValue.y,
      w: L.dozenValue.w,
      h: L.dozenValue.h,
      text_size: L.dozenValue.size,
      color: PALETTE.TEXT_MAIN,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: '--/24',
      show_level: NORMAL
    });

    this.widgets.syncBtn = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: L.syncBtn.x,
      y: L.syncBtn.y,
      w: L.syncBtn.w,
      h: L.syncBtn.h,
      radius: L.syncBtn.r,
      text_size: L.syncBtn.size,
      normal_color: PALETTE.BRAND_DARK_GREEN,
      press_color: 0x145336,
      color: PALETTE.TEXT_MAIN,
      text: '↻ Collega',
      show_level: NORMAL,
      click_func: () => {
        hmApp.startApp({
          appid: COMPANION_APP_ID,
          url: 'page/index'
        });
      }
    });

    // Minimal Always-On Display (AOD) Widgets
    this.widgets.aodClock = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.aodClock.x,
      y: L.aodClock.y,
      w: L.aodClock.w,
      h: L.aodClock.h,
      text_size: L.aodClock.size,
      color: PALETTE.AOD_DIM,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: '00:00',
      show_level: AOD
    });

    this.widgets.aodTag = hmUI.createWidget(hmUI.widget.TEXT, {
      x: L.aodTag.x,
      y: L.aodTag.y,
      w: L.aodTag.w,
      h: L.aodTag.h,
      text_size: L.aodTag.size,
      color: PALETTE.AOD_ACCENT,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: 'SYNC --',
      show_level: AOD
    });

    // Screen wake / return-from-companion delegate (Zepp OS 1.0 uses resume_call / pause_call)
    hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
      resume_call: () => {
        this.refreshAll();
      },
      pause_call: () => {},
      show_level: NORMAL | AOD
    });

    // Minute rollover listener so both Normal and AOD clocks/timers advance every minute
    if (this.sensors.time && this.sensors.time.addEventListener && this.sensors.time.event) {
      this.minuteListener = () => {
        this.refreshAll();
      };
      this.sensors.time.addEventListener(this.sensors.time.event.MINUTEEND, this.minuteListener);
    }

    this.refreshAll();
  },

  onDestroy() {
    if (
      this.minuteListener &&
      this.sensors.time &&
      this.sensors.time.removeEventListener &&
      this.sensors.time.event
    ) {
      try {
        this.sensors.time.removeEventListener(this.sensors.time.event.MINUTEEND, this.minuteListener);
      } catch (_) {}
      this.minuteListener = null;
    }
  }
});
