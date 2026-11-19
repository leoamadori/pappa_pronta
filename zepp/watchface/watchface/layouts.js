/**
 * Declarative Geometry & Color Maps for GTS 4 Mini (336x384 Square)
 * and Active 2 Round (466x466 Circular AMOLED) + Minimal AOD (< 10% lit pixels).
 */

export const PALETTE = {
  BG: 0x000000,
  CARD_BG: 0x101b16,
  BAR_TRACK: 0x1f2e27,
  PRIMARY_GREEN: 0x34d399,
  BRAND_DARK_GREEN: 0x1b6b46,
  ACCENT_AMBER: 0xfbbf24,
  ACCENT_BLUE: 0x60a5fa,
  TEXT_MAIN: 0xffffff,
  TEXT_MUTED: 0x9ca3af,
  AOD_DIM: 0x9ca3af,
  AOD_ACCENT: 0x34d399
};

export const LAYOUT_SQUARE_336 = {
  width: 336,
  height: 384,
  dateStatus: { x: 28, y: 16, w: 280, h: 24, size: 18 },
  clock: { x: 18, y: 40, w: 300, h: 68, size: 58 },
  fastCard: { x: 14, y: 116, w: 308, h: 98, r: 16 },
  fastTitle: { x: 26, y: 123, w: 140, h: 22, size: 16 },
  fastPrimary: { x: 166, y: 120, w: 144, h: 28, size: 24 },
  fastBarTrack: { x: 26, y: 154, w: 284, h: 10, r: 5 },
  fastSecondary: { x: 26, y: 171, w: 284, h: 24, size: 17 },
  moveCard: { x: 14, y: 224, w: 150, h: 142, r: 16 },
  moveTitle: { x: 22, y: 232, w: 134, h: 22, size: 16 },
  moveSteps: { x: 22, y: 260, w: 134, h: 34, size: 26 },
  moveKcal: { x: 22, y: 298, w: 134, h: 24, size: 17 },
  moveGoalTag: { x: 22, y: 328, w: 134, h: 24, size: 16 },
  dozenCard: { x: 172, y: 224, w: 150, h: 142, r: 16 },
  dozenTitle: { x: 180, y: 232, w: 134, h: 22, size: 16 },
  dozenValue: { x: 180, y: 258, w: 134, h: 36, size: 28 },
  syncBtn: { x: 182, y: 302, w: 130, h: 54, r: 14, size: 18 },
  aodClock: { x: 28, y: 136, w: 280, h: 64, size: 54 },
  aodTag: { x: 38, y: 208, w: 260, h: 28, size: 20 }
};

export const LAYOUT_ROUND_466 = {
  width: 466,
  height: 466,
  // Safe circular chord margins enforced at every vertical Y band
  dateStatus: { x: 108, y: 34, w: 250, h: 26, size: 20 },
  clock: { x: 73, y: 62, w: 320, h: 82, size: 70 },
  fastCard: { x: 48, y: 152, w: 370, h: 108, r: 22 },
  fastTitle: { x: 66, y: 162, w: 168, h: 26, size: 18 },
  fastPrimary: { x: 236, y: 158, w: 164, h: 34, size: 28 },
  fastBarTrack: { x: 66, y: 198, w: 334, h: 12, r: 6 },
  fastSecondary: { x: 66, y: 218, w: 334, h: 26, size: 19 },
  moveCard: { x: 58, y: 272, w: 170, h: 132, r: 20 },
  moveTitle: { x: 68, y: 280, w: 150, h: 24, size: 17 },
  moveSteps: { x: 68, y: 308, w: 150, h: 38, size: 30 },
  moveKcal: { x: 68, y: 348, w: 150, h: 24, size: 18 },
  moveGoalTag: { x: 68, y: 374, w: 150, h: 24, size: 16 },
  dozenCard: { x: 238, y: 272, w: 170, h: 132, r: 20 },
  dozenTitle: { x: 248, y: 280, w: 150, h: 24, size: 17 },
  dozenValue: { x: 248, y: 306, w: 150, h: 40, size: 32 },
  syncBtn: { x: 250, y: 350, w: 146, h: 48, r: 16, size: 19 },
  aodClock: { x: 83, y: 178, w: 300, h: 74, size: 64 },
  aodTag: { x: 93, y: 260, w: 280, h: 32, size: 22 }
};

export function selectLayoutForDevice() {
  if (typeof hmSetting !== 'undefined' && hmSetting.getDeviceInfo) {
    const info = hmSetting.getDeviceInfo();
    if (info && info.width >= 440) {
      return LAYOUT_ROUND_466;
    }
  }
  return LAYOUT_SQUARE_336;
}
