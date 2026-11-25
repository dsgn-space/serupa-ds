// src/internal/bidi.ts
var FSI = "\u2068";
var PDI = "\u2069";
var HAS_LTR = /[A-Za-z]/;
var HAS_RTL = /[\u0590-\u08FF\uFB1D-\uFEFC]/;
var isolate = (text, dir) => dir ? (dir === "rtl" ? "\u2067" : "\u2066") + text + PDI : text;
var bidi = (text, ui = "ltr") => text && (ui === "rtl" ? HAS_LTR.test(text) : HAS_RTL.test(text)) && !text.startsWith(FSI) ? FSI + text + PDI : text;
export {
  bidi,
  isolate
};
//# sourceMappingURL=bidi.js.map
