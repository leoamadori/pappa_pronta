import {
  SYSPRO_KEY,
  SYNC_STATUS,
  STATUS_MESSAGES_IT,
  parseWatchState
} from '../shared/contract';

function getScreenSize() {
  if (typeof hmSetting !== 'undefined' && hmSetting.getDeviceInfo) {
    const info = hmSetting.getDeviceInfo();
    if (info && info.width && info.height) {
      return { w: info.width, h: info.height };
    }
  }
  return { w: 336, h: 384 };
}

Page({
  state: {
    titleWidget: null,
    subWidget: null,
    closeBtn: null,
    vib: null,
    timeoutTimer: null,
    exitTimer: null,
    finished: false
  },

  stopVibrateSafe() {
    if (this.state.vib) {
      try {
        this.state.vib.stop();
      } catch (_) {}
    }
  },

  pulseConfirm() {
    try {
      const vib = hmSensor.createSensor(hmSensor.id.VIBRATE);
      this.state.vib = vib;
      vib.stop();
      vib.scene = 23;
      vib.start();
    } catch (_) {}
  },

  showCloseButton(w, h) {
    if (this.state.closeBtn) return;
    const btnW = Math.min(200, w - 72);
    this.state.closeBtn = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: Math.floor((w - btnW) / 2),
      y: h - 92,
      w: btnW,
      h: 52,
      radius: 26,
      normal_color: 0x1b6b46,
      press_color: 0x145336,
      color: 0xffffff,
      text_size: 22,
      text: 'Chiudi',
      click_func: () => {
        this.stopVibrateSafe();
        hmApp.goBack();
      }
    });
  },

  renderOutcome(w, h, statusCode, serialized) {
    if (this.state.finished) return;
    this.state.finished = true;
    if (this.state.timeoutTimer) {
      clearTimeout(this.state.timeoutTimer);
      this.state.timeoutTimer = null;
    }

    if (statusCode === SYNC_STATUS.OK && serialized && parseWatchState(serialized)) {
      hmFS.SysProSetChars(SYSPRO_KEY, serialized);
      this.pulseConfirm();
      this.state.titleWidget.setProperty(hmUI.prop.MORE, {
        text: 'Aggiornato',
        color: 0x34d399
      });
      this.state.subWidget.setProperty(hmUI.prop.MORE, {
        text: 'Ritorno al quadrante...'
      });
      this.state.exitTimer = setTimeout(() => {
        this.stopVibrateSafe();
        hmApp.goBack();
      }, 450);
      return;
    }

    const errText = STATUS_MESSAGES_IT[statusCode] || STATUS_MESSAGES_IT[SYNC_STATUS.HTTP_ERR];
    this.state.titleWidget.setProperty(hmUI.prop.MORE, {
      text: 'Sync non riuscita',
      color: 0xfbbf24
    });
    this.state.subWidget.setProperty(hmUI.prop.MORE, {
      text: errText
    });
    this.showCloseButton(w, h);
  },

  build() {
    const { w, h } = getScreenSize();
    const padX = Math.floor(w * 0.11);
    const boxW = w - padX * 2;

    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w,
      h,
      color: 0x000000
    });

    this.state.titleWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: padX,
      y: Math.floor(h * 0.28),
      w: boxW,
      h: 44,
      color: 0x34d399,
      text_size: 26,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: 'Pappa Pronta'
    });

    this.state.subWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: padX,
      y: Math.floor(h * 0.42),
      w: boxW,
      h: 96,
      color: 0xe5e7eb,
      text_size: 20,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_style: hmUI.text_style.WRAP,
      text: 'Sincronizzazione...'
    });

    if (typeof hmBle !== 'undefined' && hmBle.connectStatus && !hmBle.connectStatus()) {
      this.renderOutcome(w, h, SYNC_STATUS.NO_BLE, '');
      return;
    }

    const app = getApp();
    const mb = app && app._options && app._options.globalData && app._options.globalData.messageBuilder;
    if (!mb) {
      this.renderOutcome(w, h, SYNC_STATUS.NO_BLE, '');
      return;
    }

    this.state.timeoutTimer = setTimeout(() => {
      this.renderOutcome(w, h, SYNC_STATUS.HTTP_ERR, '');
    }, 8500);

    mb.request({ method: 'SYNC_WATCH' }, { timeout: 8000 })
      .then((res) => {
        const code = res && typeof res.status === 'number' ? res.status : SYNC_STATUS.HTTP_ERR;
        const ser = res && typeof res.serialized === 'string' ? res.serialized : '';
        this.renderOutcome(w, h, code, ser);
      })
      .catch(() => {
        this.renderOutcome(w, h, SYNC_STATUS.NO_BLE, '');
      });
  },

  onDestroy() {
    if (this.state.timeoutTimer) {
      clearTimeout(this.state.timeoutTimer);
      this.state.timeoutTimer = null;
    }
    if (this.state.exitTimer) {
      clearTimeout(this.state.exitTimer);
      this.state.exitTimer = null;
    }
    this.stopVibrateSafe();
  }
});
