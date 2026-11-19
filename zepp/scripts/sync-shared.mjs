import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zeppRoot = path.resolve(__dirname, '..');
const sharedDir = path.join(zeppRoot, 'shared');
const bleDir = path.join(sharedDir, 'ble');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

// 1. Sync shared contract + BLE v1.0 MessageBuilder helpers into companion & watchface roots
// so @zeppos/zeus-cli Rollup bundler resolves and transpiles them inside each project root.
const companionShared = path.join(zeppRoot, 'companion', 'shared');
const watchfaceShared = path.join(zeppRoot, 'watchface', 'shared');
ensureDir(companionShared);
ensureDir(watchfaceShared);

copyFile(path.join(sharedDir, 'contract.js'), path.join(companionShared, 'contract.js'));
copyFile(path.join(sharedDir, 'contract.js'), path.join(watchfaceShared, 'contract.js'));

for (const entry of fs.readdirSync(bleDir)) {
  if (entry.endsWith('.js')) {
    copyFile(path.join(bleDir, entry), path.join(companionShared, entry));
  }
}

// 2. Deterministic pure-Node PNG generator for Zepp icons & Watch Face previews
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createWatchAssetPng(width, height, isRound) {
  const raw = Buffer.alloc(height * (1 + width * 4), 0);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2 - 2;

  for (let y = 0; y < height; y++) {
    const rowOff = y * (1 + width * 4);
    raw[rowOff] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const pxOff = rowOff + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isRound && dist > maxR) {
        raw[pxOff + 3] = 0;
        continue;
      }

      // Dark AMOLED background (#0D1612) with emerald Pappa Pronta ring (#1B6B46 / #34D399)
      let r = 13;
      let g = 22;
      let b = 18;
      const ringOuter = maxR * 0.84;
      const ringInner = maxR * 0.70;
      if (dist <= ringOuter && dist >= ringInner) {
        r = 52;
        g = 211;
        b = 153;
      } else if (dist < maxR * 0.36 && y > cy - maxR * 0.05 && y < cy + maxR * 0.28) {
        // Stylized white bowl center mark
        r = 245;
        g = 250;
        b = 247;
      }

      raw[pxOff] = r;
      raw[pxOff + 1] = g;
      raw[pxOff + 2] = b;
      raw[pxOff + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const assetTargets = [
  { file: path.join(zeppRoot, 'companion', 'assets', 'gts4mini', 'icon.png'), w: 80, h: 80, round: true },
  { file: path.join(zeppRoot, 'companion', 'assets', 'active2round', 'icon.png'), w: 124, h: 124, round: true },
  { file: path.join(zeppRoot, 'watchface', 'assets', 'gts4mini', 'images', 'preview.png'), w: 228, h: 260, round: false },
  { file: path.join(zeppRoot, 'watchface', 'assets', 'active2round', 'images', 'preview.png'), w: 300, h: 300, round: true }
];

for (const item of assetTargets) {
  ensureDir(path.dirname(item.file));
  fs.writeFileSync(item.file, createWatchAssetPng(item.w, item.h, item.round));
}

console.log('Synced zepp/shared modules and verified PNG assets.');
