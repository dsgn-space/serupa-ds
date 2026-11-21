// The pseudo-locale (serupa-ds/labels/pseudo): every word stays readable but comes out accented, about 40% longer and
// between ⟦ ⟧, so a layout that clips, wraps badly or can't fit a longer language (German, Finnish) shows up before a
// translation exists, a word written into the code stays plain English among the accented ones, and a missing ⟧ marks
// text cut short.

const ACCENTED: Record<string, string> = {
  a: 'á', b: 'ƀ', c: 'ç', d: 'ð', e: 'é', f: 'ƒ', g: 'ĝ', h: 'ĥ', i: 'í', j: 'ĵ', k: 'ķ', l: 'ļ', m: 'ɱ', n: 'ñ', o: 'ö', p: 'þ', q: 'ǫ', r: 'ŕ', s: 'š', t: 'ţ',
  u: 'û', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ý', z: 'ž', A: 'Á', B: 'Ɓ', C: 'Ç', D: 'Ð', E: 'É', F: 'Ƒ', G: 'Ĝ', H: 'Ĥ', I: 'Í', J: 'Ĵ', K: 'Ķ', L: 'Ļ', M: 'Ṁ',
  N: 'Ñ', O: 'Ö', P: 'Þ', Q: 'Ǫ', R: 'Ŕ', S: 'Š', T: 'Ţ', U: 'Û', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ', Y: 'Ý', Z: 'Ž',
};
const VOWEL = /[aeiouAEIOU]/;
// Text a function label was given (a file name, a count already written out) is marked with these two private-use
// characters, so it comes through as it was: only the label's own words are pseudo.
const OPEN = '', CLOSE = '';

/** Pseudo text: each letter accented, vowels doubled until the text is at least 40% longer, between ⟦ ⟧. Text marked
 *  as given (see pseudoLabels) and anything that isn't an ASCII letter stay as they are; empty text stays empty. */
export function pseudo(text: string): string {
  if (!text.trim()) return text;
  const plain = text.replace(/[^]*/g, '');
  let extra = Math.ceil(plain.length * 0.4);
  let out = '', given = false;
  for (const ch of text) {
    if (ch === OPEN || ch === CLOSE) { given = ch === OPEN; continue; }
    if (given || !ACCENTED[ch]) { out += ch; continue; }
    out += ACCENTED[ch];
    if (extra > 0 && VOWEL.test(ch)) { out += ACCENTED[ch]; extra--; }
  }
  // Few vowels ("Strg", "PDF"): the rest of the 40% as a tail, so every word grows.
  return '⟦' + out + (extra > 0 ? ' ' + '~'.repeat(extra) : '') + '⟧';
}

// A function label's arguments are either a value it words ("month", "high", "valueMissing": a lowercase name) or
// text it passes on (a file name, a field's label, a count already written out). The text it passes on is found in
// the result and left as it was; the values it words come out pseudo with the rest.
const given = (a: unknown, out: string[]): string[] => {
  if (typeof a === 'string' && a && !/^[a-z][a-zA-Z -]*$/.test(a)) out.push(a);
  else if (Array.isArray(a)) for (const x of a) given(x, out);
  return out;
};
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A whole label set in the pseudo-locale: each text label through pseudo(), and each function label's result too, with
 *  the text it was given (names, numbers already written out) left as it was. */
export function pseudoLabels<T extends object>(labels: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(labels)) {
    out[k] = typeof v !== 'function' ? (typeof v === 'string' ? pseudo(v) : v) : (...args: unknown[]) => {
      const r: unknown = (v as (...a: unknown[]) => unknown)(...args);
      if (typeof r !== 'string') return r;
      const keep = args.reduce<string[]>((o, a) => given(a, o), []).sort((a, b) => b.length - a.length);
      return pseudo(keep.length ? r.replace(new RegExp(keep.map(escape).join('|'), 'g'), (m) => OPEN + m + CLOSE) : r);
    };
  }
  return out as T;
}
