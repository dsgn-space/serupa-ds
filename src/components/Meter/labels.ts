// Meter's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export type MeterZone = 'low' | 'medium' | 'high';
export interface MeterLabels {
  /** Meter: read out after the value when it's outside the best zone, so the warning the color gives is heard too
      ("92%, high"). zone is where the value falls: under low, between low and high, or over high. */
  meterZone: (value: string, zone: MeterZone) => string;
}
const EN: Record<MeterZone, string> = { low: "low", medium: "medium", high: "high" };
const ID: Record<MeterZone, string> = { low: "rendah", medium: "sedang", high: "tinggi" };
export const en: MeterLabels = {
  meterZone: (value, zone) => value + ", " + EN[zone],
};
export const id: MeterLabels = {
  meterZone: (value, zone) => value + ", " + ID[zone],
};
