import './shared/device-polyfill';
import { MessageBuilder } from './shared/message';
import { COMPANION_APP_ID } from './shared/contract';

App({
  globalData: {
    messageBuilder: null
  },
  onCreate() {
    let appId = COMPANION_APP_ID;
    if (typeof hmApp !== 'undefined' && hmApp.packageInfo) {
      const info = hmApp.packageInfo();
      if (info && info.appId) {
        appId = info.appId;
      }
    }
    const mb = new MessageBuilder({ appId });
    this.globalData.messageBuilder = mb;
    mb.connect();
  },
  onDestroy() {
    if (this.globalData && this.globalData.messageBuilder) {
      this.globalData.messageBuilder.disConnect();
    }
  }
});
