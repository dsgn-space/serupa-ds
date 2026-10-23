// Steps for Slider and NumberInput. The grid is min, min + step, min + 2 × step…, so values keep as many decimals as
// min or step has: min 0.5 with step 1 gives 0.5, 1.5, 2.5. Rounding to the step's decimals alone would turn 2.5 into 3.

/** How many decimals a number is written with: 0.25 → 2, 1e-7 → 7, 1.5e-3 → 4, 100 → 0. */
export function decimals(n: number): number {
  if (!isFinite(n)) return 0;
  const [mantissa, exp] = String(n).split("e");
  const frac = (mantissa.split(".")[1] || "").length;
  return Math.max(0, frac - Number(exp || 0));
}
/** The places that values on the grid of min and step need. */
export const gridPlaces = (min: number | undefined, step: number) => Math.max(decimals(step), min === undefined ? 0 : decimals(min));
/** v rounded to the given decimals, without float noise (0.1 + 0.2 → 0.3). Capped at 20, the most toFixed takes. */
export const roundTo = (v: number, places: number) => Number(v.toFixed(Math.min(20, places)));
/** v on the nearest grid point of min and step, within min..max. */
export function snap(v: number, min: number, max: number, step: number): number {
  const n = roundTo(Math.round((v - min) / step) * step + min, gridPlaces(min, step));
  return Math.min(max, Math.max(min, n));
}
