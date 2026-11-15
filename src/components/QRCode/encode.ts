/* A QR code encoder (ISO/IEC 18004, Model 2), written for serupa so the package needs no dependency for it. It takes
   text as UTF-8 bytes (byte mode, which every scanner reads), picks the smallest of the 40 versions that holds it at
   the asked error correction, adds Reed–Solomon error correction, places the data and picks the mask with the lowest
   penalty, as the standard says. The result is a square of booleans, true for a dark module, without the quiet zone. */

/** How much of the code can be damaged or covered and still read: about 7% (L), 15% (M), 25% (Q) or 30% (H). */
export type QRErrorLevel = 'L' | 'M' | 'Q' | 'H';

// Per level (L, M, Q, H), indexed by version (1–40; 0 unused): error correction codewords per block, and blocks.
const ECC_PER_BLOCK: Record<QRErrorLevel, readonly number[]> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const BLOCKS: Record<QRErrorLevel, readonly number[]> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};
// The level's two bits in the format information.
const LEVEL_BITS: Record<QRErrorLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** The modules a version holds for data and error correction, after the finder, timing, alignment and version patterns. */
function rawModules(v: number): number {
  let n = (16 * v + 128) * v + 64;
  if (v >= 2) {
    const align = Math.floor(v / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (v >= 7) n -= 36;
  }
  return n;
}
const dataCodewords = (v: number, level: QRErrorLevel) => Math.floor(rawModules(v) / 8) - ECC_PER_BLOCK[level][v]! * BLOCKS[level][v]!;

/** The centres of the alignment patterns along one side, for a version. */
function alignmentCentres(v: number): number[] {
  if (v === 1) return [];
  const count = Math.floor(v / 7) + 2, size = v * 4 + 17;
  const step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (count * 2 - 2)) * 2;
  const out = [6];
  for (let pos = size - 7; out.length < count; pos -= step) out.splice(1, 0, pos);
  return out;
}

// Galois field GF(2^8) with the QR polynomial x^8 + x^4 + x^3 + x^2 + 1.
function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}
function rsDivisor(degree: number): number[] {
  const out = new Array<number>(degree).fill(0);
  out[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      out[j] = gfMultiply(out[j]!, root);
      if (j + 1 < degree) out[j] = out[j]! ^ out[j + 1]!;
    }
    root = gfMultiply(root, 0x02);
  }
  return out;
}
function rsRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const out = new Array<number>(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ out.shift()!;
    out.push(0);
    for (let i = 0; i < divisor.length; i++) out[i] = out[i]! ^ gfMultiply(divisor[i]!, factor);
  }
  return out;
}

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** Encodes text as a QR code at the error correction level asked (default M): rows of modules, true for dark, with no
 *  quiet zone. Throws a RangeError when the text is too long for the largest code (about 2,300 bytes at M). */
export function encodeQR(text: string, level: QRErrorLevel = 'M'): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));
  // The smallest version that holds the mode, the count and the bytes.
  let v = 1;
  const need = (ver: number) => 4 + (ver <= 9 ? 8 : 16) + bytes.length * 8;
  while (v <= 40 && need(v) > dataCodewords(v, level) * 8) v++;
  if (v > 40) throw new RangeError('QRCode: the text is too long for a QR code (' + bytes.length + ' bytes)');

  // The bit stream: byte mode, the count, the bytes, a terminator, then padding to fill the version.
  const bits: number[] = [];
  const put = (value: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  put(0b0100, 4);
  put(bytes.length, v <= 9 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  const capacity = dataCodewords(v, level) * 8;
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]!; data.push(b); }

  // Split into blocks, add each block's error correction, and interleave them.
  const blocks = BLOCKS[level][v]!, eccLen = ECC_PER_BLOCK[level][v]!, raw = Math.floor(rawModules(v) / 8);
  const shortBlocks = blocks - (raw % blocks), shortLen = Math.floor(raw / blocks), divisor = rsDivisor(eccLen);
  const parts: number[][] = [];
  for (let i = 0, k = 0; i < blocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < shortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    if (i < shortBlocks) dat.push(0);   // a placeholder, so every block lines up; left out below
    parts.push(dat.concat(ecc));
  }
  const codewords: number[] = [];
  for (let i = 0; i < parts[0]!.length; i++) {
    for (let j = 0; j < parts.length; j++) if (i !== shortLen - eccLen || j >= shortBlocks) codewords.push(parts[j]![i]!);
  }

  // The fixed patterns: finders, timing, alignment, the version information and the reserved format area.
  const size = v * 4 + 17;
  const dark: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const fixed: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (x: number, y: number, on: boolean) => { dark[y]![x] = on; fixed[y]![x] = true; };
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]] as const) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  }
  const centres = alignmentCentres(v), last = centres.length - 1;
  centres.forEach((cx, i) => centres.forEach((cy, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;   // under a finder
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const format = (mask: number) => {
    const d = (LEVEL_BITS[level] << 3) | mask;
    let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const b = ((d << 10) | rem) ^ 0x5412, bit = (i: number) => ((b >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);   // the dark module
  };
  format(0);   // reserves the area, so the data goes round it
  if (v >= 7) {
    let rem = v;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const b = (v << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const on = ((b >>> i) & 1) !== 0, a = size - 11 + (i % 3), c = Math.floor(i / 3);
      set(a, c, on); set(c, a, on);
    }
  }

  // The data, in two-column strips from the bottom right, up and down in turn, skipping the timing column.
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (fixed[y]![x] || i >= codewords.length * 8) continue;
        dark[y]![x] = ((codewords[i >>> 3]! >>> (7 - (i & 7))) & 1) !== 0;
        i++;
      }
    }
  }

  // Every mask in turn; keep the one with the lowest penalty.
  const flip = (m: number) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fixed[y]![x] && MASKS[m]!(x, y)) dark[y]![x] = !dark[y]![x]; };
  let best = 0, lowest = Infinity;
  for (let m = 0; m < 8; m++) {
    flip(m); format(m);
    const p = penalty(dark);
    if (p < lowest) { lowest = p; best = m; }
    flip(m);
  }
  flip(best); format(best);
  return dark;
}

// The standard's penalty for a masked code: long runs, 2×2 blocks, finder-like patterns and an uneven share of dark.
function penalty(m: boolean[][]): number {
  const size = m.length;
  let score = 0, darkCount = 0;
  const line = (get: (i: number) => boolean) => {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && get(i) === get(i - 1)) { run++; continue; }
      if (run >= 5) score += 3 + (run - 5);
      run = 1;
    }
    // 1:1:3:1:1 with four light modules on either side, which a scanner could mistake for a finder.
    const at = (i: number) => (i < 0 || i >= size ? false : get(i));
    for (let i = 0; i + 6 < size; i++) {
      if (at(i) && !at(i + 1) && at(i + 2) && at(i + 3) && at(i + 4) && !at(i + 5) && at(i + 6)) {
        const before = !at(i - 1) && !at(i - 2) && !at(i - 3) && !at(i - 4), after = !at(i + 7) && !at(i + 8) && !at(i + 9) && !at(i + 10);
        if (before) score += 40;
        if (after) score += 40;
      }
    }
  };
  for (let y = 0; y < size; y++) line((x) => m[y]![x]!);
  for (let x = 0; x < size; x++) line((y) => m[y]![x]!);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (m[y]![x]) darkCount++;
    if (x + 1 < size && y + 1 < size) { const c = m[y]![x]; if (c === m[y]![x + 1] && c === m[y + 1]![x] && c === m[y + 1]![x + 1]) score += 3; }
  }
  const total = size * size;
  score += (Math.ceil(Math.abs(darkCount * 20 - total * 10) / total) - 1) * 10;
  return score;
}
