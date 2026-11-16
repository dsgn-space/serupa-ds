// src/internal/space.ts
var SPACE = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "16", "20", "24"];
function space(step) {
  const s = typeof step === "number" || typeof step === "string" ? String(step) : "";
  return SPACE.indexOf(s) < 0 ? void 0 : "var(--spacing-" + s.replace(/[\\.]/g, "\\$&") + ")";
}
var WIDTHS = ["sm", "md", "lg"];
function atWidths(value) {
  if (value == null || typeof value !== "object") return null;
  const map = value;
  const out = { base: map.base, sm: map.base, md: map.base, lg: map.base };
  let at = map.base;
  for (const w of WIDTHS) {
    if (map[w] != null) at = map[w];
    out[w] = at;
  }
  return out;
}
export {
  SPACE,
  WIDTHS,
  atWidths,
  space
};
//# sourceMappingURL=space.js.map
