// src/components/QRCode/encode.ts
var ECC_PER_BLOCK = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
};
var BLOCKS = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
};
var LEVEL_BITS = { L: 1, M: 0, Q: 3, H: 2 };
function rawModules(v) {
  let n = (16 * v + 128) * v + 64;
  if (v >= 2) {
    const align = Math.floor(v / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (v >= 7) n -= 36;
  }
  return n;
}
var dataCodewords = (v, level) => Math.floor(rawModules(v) / 8) - ECC_PER_BLOCK[level][v] * BLOCKS[level][v];
function alignmentCentres(v) {
  if (v === 1) return [];
  const count = Math.floor(v / 7) + 2, size = v * 4 + 17;
  const step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (count * 2 - 2)) * 2;
  const out = [6];
  for (let pos = size - 7; out.length < count; pos -= step) out.splice(1, 0, pos);
  return out;
}
function gfMultiply(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = z << 1 ^ (z >>> 7) * 285;
    z ^= (y >>> i & 1) * x;
  }
  return z;
}
function rsDivisor(degree) {
  const out = new Array(degree).fill(0);
  out[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      out[j] = gfMultiply(out[j], root);
      if (j + 1 < degree) out[j] = out[j] ^ out[j + 1];
    }
    root = gfMultiply(root, 2);
  }
  return out;
}
function rsRemainder(data, divisor) {
  const out = new Array(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ out.shift();
    out.push(0);
    for (let i = 0; i < divisor.length; i++) out[i] = out[i] ^ gfMultiply(divisor[i], factor);
  }
  return out;
}
var MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (_, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => x * y % 2 + x * y % 3 === 0,
  (x, y) => (x * y % 2 + x * y % 3) % 2 === 0,
  (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0
];
function encodeQR(text, level = "M") {
  const bytes = Array.from(new TextEncoder().encode(text));
  let v = 1;
  const need = (ver) => 4 + (ver <= 9 ? 8 : 16) + bytes.length * 8;
  while (v <= 40 && need(v) > dataCodewords(v, level) * 8) v++;
  if (v > 40) throw new RangeError("QRCode: the text is too long for a QR code (" + bytes.length + " bytes)");
  const bits = [];
  const put = (value, n) => {
    for (let i2 = n - 1; i2 >= 0; i2--) bits.push(value >>> i2 & 1);
  };
  put(4, 4);
  put(bytes.length, v <= 9 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  const capacity = dataCodewords(v, level) * 8;
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - bits.length % 8) % 8);
  for (let pad = 236; bits.length < capacity; pad ^= 236 ^ 17) put(pad, 8);
  const data = [];
  for (let i2 = 0; i2 < bits.length; i2 += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = b << 1 | bits[i2 + j];
    data.push(b);
  }
  const blocks = BLOCKS[level][v], eccLen = ECC_PER_BLOCK[level][v], raw = Math.floor(rawModules(v) / 8);
  const shortBlocks = blocks - raw % blocks, shortLen = Math.floor(raw / blocks), divisor = rsDivisor(eccLen);
  const parts = [];
  for (let i2 = 0, k = 0; i2 < blocks; i2++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i2 < shortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    if (i2 < shortBlocks) dat.push(0);
    parts.push(dat.concat(ecc));
  }
  const codewords = [];
  for (let i2 = 0; i2 < parts[0].length; i2++) {
    for (let j = 0; j < parts.length; j++) if (i2 !== shortLen - eccLen || j >= shortBlocks) codewords.push(parts[j][i2]);
  }
  const size = v * 4 + 17;
  const dark = Array.from({ length: size }, () => new Array(size).fill(false));
  const fixed = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, on) => {
    dark[y][x] = on;
    fixed[y][x] = true;
  };
  for (let i2 = 0; i2 < size; i2++) {
    set(6, i2, i2 % 2 === 0);
    set(i2, 6, i2 % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  }
  const centres = alignmentCentres(v), last = centres.length - 1;
  centres.forEach((cx, i2) => centres.forEach((cy, j) => {
    if (i2 === 0 && j === 0 || i2 === 0 && j === last || i2 === last && j === 0) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const format = (mask) => {
    const d = LEVEL_BITS[level] << 3 | mask;
    let rem = d;
    for (let i2 = 0; i2 < 10; i2++) rem = rem << 1 ^ (rem >>> 9) * 1335;
    const b = (d << 10 | rem) ^ 21522, bit = (i2) => (b >>> i2 & 1) !== 0;
    for (let i2 = 0; i2 <= 5; i2++) set(8, i2, bit(i2));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i2 = 9; i2 < 15; i2++) set(14 - i2, 8, bit(i2));
    for (let i2 = 0; i2 < 8; i2++) set(size - 1 - i2, 8, bit(i2));
    for (let i2 = 8; i2 < 15; i2++) set(8, size - 15 + i2, bit(i2));
    set(8, size - 8, true);
  };
  format(0);
  if (v >= 7) {
    let rem = v;
    for (let i2 = 0; i2 < 12; i2++) rem = rem << 1 ^ (rem >>> 11) * 7973;
    const b = v << 12 | rem;
    for (let i2 = 0; i2 < 18; i2++) {
      const on = (b >>> i2 & 1) !== 0, a = size - 11 + i2 % 3, c = Math.floor(i2 / 3);
      set(a, c, on);
      set(c, a, on);
    }
  }
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j, up = (right + 1 & 2) === 0, y = up ? size - 1 - vert : vert;
        if (fixed[y][x] || i >= codewords.length * 8) continue;
        dark[y][x] = (codewords[i >>> 3] >>> 7 - (i & 7) & 1) !== 0;
        i++;
      }
    }
  }
  const flip = (m) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fixed[y][x] && MASKS[m](x, y)) dark[y][x] = !dark[y][x];
  };
  let best = 0, lowest = Infinity;
  for (let m = 0; m < 8; m++) {
    flip(m);
    format(m);
    const p = penalty(dark);
    if (p < lowest) {
      lowest = p;
      best = m;
    }
    flip(m);
  }
  flip(best);
  format(best);
  return dark;
}
function penalty(m) {
  const size = m.length;
  let score = 0, darkCount = 0;
  const line = (get) => {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && get(i) === get(i - 1)) {
        run++;
        continue;
      }
      if (run >= 5) score += 3 + (run - 5);
      run = 1;
    }
    const at = (i) => i < 0 || i >= size ? false : get(i);
    for (let i = 0; i + 6 < size; i++) {
      if (at(i) && !at(i + 1) && at(i + 2) && at(i + 3) && at(i + 4) && !at(i + 5) && at(i + 6)) {
        const before = !at(i - 1) && !at(i - 2) && !at(i - 3) && !at(i - 4), after = !at(i + 7) && !at(i + 8) && !at(i + 9) && !at(i + 10);
        if (before) score += 40;
        if (after) score += 40;
      }
    }
  };
  for (let y = 0; y < size; y++) line((x) => m[y][x]);
  for (let x = 0; x < size; x++) line((y) => m[y][x]);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (m[y][x]) darkCount++;
    if (x + 1 < size && y + 1 < size) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
    }
  }
  const total = size * size;
  score += (Math.ceil(Math.abs(darkCount * 20 - total * 10) / total) - 1) * 10;
  return score;
}
export {
  encodeQR
};
//# sourceMappingURL=encode.js.map
