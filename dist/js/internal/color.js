// src/internal/color.ts
function normalizeHex(text) {
  const t = text.normalize("NFKC").trim();
  const rgb = /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*(1|1\.0+|100%)\s*)?\)$/i.exec(t);
  if (rgb) {
    const c = rgb.slice(1, 4).map(Number);
    return c.every((v) => v < 256) ? "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("") : null;
  }
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})(f|ff)?$/i.exec(t);
  const [, body = "", alpha] = m || [];
  if (!m || alpha && alpha.length !== (body.length === 3 ? 1 : 2)) return null;
  const h = body.length === 3 ? body.replace(/./g, (c) => c + c) : body;
  return "#" + h.toLowerCase();
}
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(n >> 16) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255);
}
function contrastRatio(a, b) {
  const x = normalizeHex(a), y = normalizeHex(b);
  if (!x || !y) return null;
  const lx = luminance(x), ly = luminance(y);
  return (Math.max(lx, ly) + 0.05) / (Math.min(lx, ly) + 0.05);
}
function colorName(hex) {
  const x = normalizeHex(hex);
  if (!x) return null;
  const n = parseInt(x.slice(1), 16);
  const r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const tone = l < 0.36 ? "dark" : l > 0.75 ? "light" : "";
  if (l < 0.1) return { hue: "black", tone: "" };
  if (l > 0.94) return { hue: "white", tone: "" };
  if (s < 0.12) return { hue: "gray", tone };
  const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
  const hue = h < 15 || h >= 345 ? "red" : h < 45 ? l < 0.4 ? "brown" : "orange" : h < 66 ? l < 0.35 ? "brown" : "yellow" : h < 165 ? "green" : h < 195 ? "teal" : h < 255 ? "blue" : h < 290 ? "purple" : "pink";
  return { hue, tone: hue === "brown" ? "" : tone };
}
export {
  colorName,
  contrastRatio,
  normalizeHex
};
//# sourceMappingURL=color.js.map
