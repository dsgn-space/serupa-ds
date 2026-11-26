// src/components/Avatar/initials.ts
var segmenter;
function graphemes(s) {
  if (segmenter === void 0) segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
  return segmenter ? Array.from(segmenter.segment(s), (g) => g.segment) : Array.from(s);
}
var INITIAL = /^[\p{L}\p{N}\p{Extended_Pictographic}]/u;
function initial(word) {
  const g = graphemes(word).find((c) => INITIAL.test(c));
  return g ? graphemes(g.toUpperCase())[0] ?? "" : "";
}
var HONORIFIC = /^(?:mr|mrs|ms|miss|mx|dr|prof|rev|sir|madam|lady|lord|capt|col|gen|lt|sgt)\.?$/i;
var SUFFIX = /^(?:jr|sr|ii|iii|iv|v|phd|md|dds|esq)\.?$/i;
function initials(name) {
  const words = (name || "").trim().split(/\s+/).filter((w) => initial(w));
  if (!words.length) return "";
  let start = 0, end = words.length;
  while (end - start > 1 && HONORIFIC.test(words[start])) start++;
  while (end - start > 1 && SUFFIX.test(words[end - 1])) end--;
  const picked = words.slice(start, end);
  const first = initial(picked[0]), last = initial(picked[picked.length - 1]);
  if (picked.length === 1) return first;
  return first + (JOINING.test(first) && JOINING.test(last) ? "\u200C" : "") + last;
}
var JOINING = /^[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Manichaean}\p{Script=Psalter_Pahlavi}\p{Script=Hanifi_Rohingya}\p{Script=Sogdian}]/u;
export {
  initials
};
//# sourceMappingURL=initials.js.map
