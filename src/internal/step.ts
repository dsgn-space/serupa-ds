// Steps for Slider and NumberInput. The grid is min, min + step, min + 2 × step…, so values keep as many decimals as
// min or step has: min 0.5 with step 1 gives 0.5, 1.5, 2.5. Rounding to the step's decimals alone would turn 2.5 into 3.

/** How many decimals a number is written with: 0.25 → 2, 1e-7 → 7, 1.5e-3 → 4, 100 → 0. */
export function decimals(n: number): number {
  if (!isFinite(n)) return 0;
  const [mantissa = '', exp] = String(n).split('e');
  const frac = (mantissa.split('.')[1] || '').length;
  return Math.max(0, frac - Number(exp || 0));
}
/** The places that values on the grid of min and step need. */
export const gridPlaces = (min: number | undefined, step: number) => Math.max(decimals(step), min === undefined ? 0 : decimals(min));
/** v rounded to the given decimals, without float noise (0.1 + 0.2 → 0.3). Capped at 20, the most toFixed takes. */
export const roundTo = (v: number, places: number) => Number(v.toFixed(Math.min(20, places)));
/** v on the nearest grid point of min and step, within min..max. When max isn't on the grid, the highest value is
    the last grid point below it, as for <input type="range">: min 0, max 10, step 3 stops at 9. */
export function snap(v: number, min: number, max: number, step: number): number {
  const lo = Number.isFinite(min) ? min : 0;
  const hi = Number.isFinite(max) ? max : lo;
  const a = Math.min(lo, hi), b = Math.max(lo, hi);
  const s = Number.isFinite(step) && step > 0 ? step : 1;
  const places = gridPlaces(a, s);
  const top = roundTo(Math.floor(roundTo((b - a) / s, 9)) * s + a, places);
  // Infinity and -Infinity land on top and a below; NaN would come out as NaN.
  if (Number.isNaN(v)) return a;
  const n = roundTo(Math.round((v - a) / s) * s + a, places);
  return Math.min(top, Math.max(a, n));
}
