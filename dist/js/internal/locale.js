// src/internal/locale.ts
var checked = /* @__PURE__ */ new Map();
function canonicalLocale(locale) {
  if (checked.has(locale)) return checked.get(locale);
  let ok;
  try {
    ok = Intl.getCanonicalLocales(locale.trim().replace(/_/g, "-"))[0];
  } catch {
    ok = void 0;
  }
  if (checked.size > 100) checked.clear();
  checked.set(locale, ok);
  return ok;
}
var RTL = /^(ar|he|iw|fa|ur|ps|sd|ug|yi|dv|ckb)(-|$)|-(Arab|Hebr|Thaa|Syrc|Nkoo|Adlm|Rohg)(-|$)/i;
function localeDir(locale) {
  const l = canonicalLocale(locale);
  if (!l) return void 0;
  try {
    const it = new Intl.Locale(l);
    const dir = (it.getTextInfo?.() ?? it.textInfo)?.direction;
    if (dir === "rtl" || dir === "ltr") return dir;
  } catch {
  }
  return RTL.test(l) ? "rtl" : "ltr";
}
export {
  canonicalLocale,
  localeDir
};
//# sourceMappingURL=locale.js.map
