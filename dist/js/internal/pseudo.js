// src/internal/pseudo.ts
var ACCENTED = {
  a: "\xE1",
  b: "\u0180",
  c: "\xE7",
  d: "\xF0",
  e: "\xE9",
  f: "\u0192",
  g: "\u011D",
  h: "\u0125",
  i: "\xED",
  j: "\u0135",
  k: "\u0137",
  l: "\u013C",
  m: "\u0271",
  n: "\xF1",
  o: "\xF6",
  p: "\xFE",
  q: "\u01EB",
  r: "\u0155",
  s: "\u0161",
  t: "\u0163",
  u: "\xFB",
  v: "\u1E7D",
  w: "\u0175",
  x: "\u1E8B",
  y: "\xFD",
  z: "\u017E",
  A: "\xC1",
  B: "\u0181",
  C: "\xC7",
  D: "\xD0",
  E: "\xC9",
  F: "\u0191",
  G: "\u011C",
  H: "\u0124",
  I: "\xCD",
  J: "\u0134",
  K: "\u0136",
  L: "\u013B",
  M: "\u1E40",
  N: "\xD1",
  O: "\xD6",
  P: "\xDE",
  Q: "\u01EA",
  R: "\u0154",
  S: "\u0160",
  T: "\u0162",
  U: "\xDB",
  V: "\u1E7C",
  W: "\u0174",
  X: "\u1E8A",
  Y: "\xDD",
  Z: "\u017D"
};
var VOWEL = /[aeiouAEIOU]/;
var OPEN = "\uE000";
var CLOSE = "\uE001";
function pseudo(text) {
  if (!text.trim()) return text;
  const plain = text.replace(/[^]*/g, "");
  let extra = Math.ceil(plain.length * 0.4);
  let out = "", given2 = false;
  for (const ch of text) {
    if (ch === OPEN || ch === CLOSE) {
      given2 = ch === OPEN;
      continue;
    }
    if (given2 || !ACCENTED[ch]) {
      out += ch;
      continue;
    }
    out += ACCENTED[ch];
    if (extra > 0 && VOWEL.test(ch)) {
      out += ACCENTED[ch];
      extra--;
    }
  }
  return "\u27E6" + out + (extra > 0 ? " " + "~".repeat(extra) : "") + "\u27E7";
}
var given = (a, out) => {
  if (typeof a === "string" && a && !/^[a-z][a-zA-Z -]*$/.test(a)) out.push(a);
  else if (Array.isArray(a)) for (const x of a) given(x, out);
  return out;
};
var escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function pseudoLabels(labels) {
  const out = {};
  for (const [k, v] of Object.entries(labels)) {
    out[k] = typeof v !== "function" ? typeof v === "string" ? pseudo(v) : v : (...args) => {
      const r = v(...args);
      if (typeof r !== "string") return r;
      const keep = args.reduce((o, a) => given(a, o), []).sort((a, b) => b.length - a.length);
      return pseudo(keep.length ? r.replace(new RegExp(keep.map(escape).join("|"), "g"), (m) => OPEN + m + CLOSE) : r);
    };
  }
  return out;
}
export {
  pseudo,
  pseudoLabels
};
//# sourceMappingURL=pseudo.js.map
