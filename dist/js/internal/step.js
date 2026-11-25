// src/internal/step.ts
function decimals(n) {
  if (!isFinite(n)) return 0;
  const [mantissa = "", exp] = String(n).split("e");
  const frac = (mantissa.split(".")[1] || "").length;
  return Math.max(0, frac - Number(exp || 0));
}
var gridPlaces = (min, step) => Math.max(decimals(step), min === void 0 ? 0 : decimals(min));
var roundTo = (v, places) => Number(v.toFixed(Math.min(20, places)));
function snap(v, min, max, step) {
  const lo = Number.isFinite(min) ? min : 0;
  const hi = Number.isFinite(max) ? max : lo;
  const [a, b] = lo <= hi ? [lo, hi] : [hi, lo];
  const s = Number.isFinite(step) && step > 0 ? step : 1;
  const places = gridPlaces(a, s);
  const top = roundTo(Math.floor(roundTo((b - a) / s, 9)) * s + a, places);
  if (!Number.isFinite(v)) return v > 0 ? top : a;
  const n = roundTo(Math.round((v - a) / s) * s + a, places);
  return Math.min(top, Math.max(a, n));
}
export {
  decimals,
  gridPlaces,
  roundTo,
  snap
};
//# sourceMappingURL=step.js.map
