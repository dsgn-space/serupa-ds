/** A CSS time as milliseconds: "200ms", "0.2s" and ".2s" (what a minifier makes of 200ms) all read 200. */
export const toMs = (t: string): number => (parseFloat(t) || 0) * (t.trim().endsWith('ms') ? 1 : 1000);
