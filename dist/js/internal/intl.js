// src/internal/intl.ts
var made = /* @__PURE__ */ new Map();
function kept(kind, C, locale, options) {
  const key = kind + "|" + (locale || "") + "|" + (options ? JSON.stringify(options) : "");
  let f = made.get(key);
  if (!f) {
    f = new C(locale, options);
    if (made.size >= 500) made.clear();
    made.set(key, f);
  }
  return f;
}
var numberFormat = (locale, options) => kept("n", Intl.NumberFormat, locale, options);
var dateFormat = (locale, options) => kept("d", Intl.DateTimeFormat, locale, options);
var relativeFormat = (locale, options) => kept("r", Intl.RelativeTimeFormat, locale, options);
var listFormat = (locale, options) => kept("l", Intl.ListFormat, locale, options);
export {
  dateFormat,
  listFormat,
  numberFormat,
  relativeFormat
};
//# sourceMappingURL=intl.js.map
