// src/internal/middleCut.ts
import { graphemes } from "./graphemes.js";
var JOINS = /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}]/u;
var LETTER = /[\p{L}\p{M}]/u;
function middleCutAt(name, chars) {
  const dot = name.lastIndexOf("."), ext = dot > 0 ? graphemes(name.slice(dot)).length : 0;
  let at = Math.max(0, chars.length - Math.min(chars.length, Math.min(ext, 10) + 6));
  if (at > 0 && JOINS.test(chars[at - 1] ?? "") && JOINS.test(chars[at] ?? "")) {
    while (at > 0 && LETTER.test(chars[at - 1] ?? "")) at--;
  }
  return at;
}
export {
  middleCutAt
};
//# sourceMappingURL=middleCut.js.map
