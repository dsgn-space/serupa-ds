// Colors as hex strings: reading them, and WCAG 2 contrast between two (the same formula tools/test uses).

/** "#1d4ed8" from "#1D4ED8", "1d4ed8", "#14d" or "14d"; null when it isn't a 3- or 6-digit hex color. */
export function normalizeHex(text: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return "#" + h.toLowerCase();
}

/** The relative luminance of a hex color (0 for black, 1 for white). */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG 2 contrast ratio between two hex colors, from 1 to 21; null if either isn't one. */
export function contrastRatio(a: string, b: string): number | null {
  const x = normalizeHex(a), y = normalizeHex(b);
  if (!x || !y) return null;
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}
