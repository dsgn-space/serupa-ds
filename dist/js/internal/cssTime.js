// src/internal/cssTime.ts
var toMs = (t) => (parseFloat(t) || 0) * (t.trim().endsWith("ms") ? 1 : 1e3);
export {
  toMs
};
//# sourceMappingURL=cssTime.js.map
