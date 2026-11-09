import { describe, expect, test } from 'vitest';
import { DEFAULT_LABELS, idLabels } from './labels';

// Every word a component says or shows on its own, in English and Indonesian, called with sample arguments: none is
// empty, none has doubled or stray punctuation or spacing, and none is left in English in the Indonesian set.
// Sample arguments for the labels that are functions. A label that isn't listed is called with 3 for each argument
// it takes, so a new label needs no line here unless 3 doesn't make sense for it (a name, a direction, a list); the
// check below fails when a call gives "undefined", "NaN" or "[object", and asks for one. One label per line, so two
// pull requests that each add a label don't edit the same line.
const ARGS: Record<string, unknown[]> = {
  avatarStatus: ['online'],
  cascadeHasMore: [false],
  cascadePath: [['Jawa Barat', 'Kota Bandung']],
  clearValue: ['Email'],
  colorName: ['blue', 'dark'],
  contrast: ['4.5'],
  fileMissing: [true],
  filesAdded: [['cat.png', 'dog.png']],
  fileOnlyOne: ['cat.png'],
  fileTooLarge: ['cat.png', '2 MB'],
  fileTooMany: ['cat.png', 3],
  fileWrongType: ['cat.txt', ['image', 'PDF']],
  formatHint: ['dd/mm/yyyy'],
  inputNotAccepted: ['abc'],
  invalidValue: [{ reason: 'tooShort', type: 'text', length: 3, minLength: 8 }],
  keyName: ['Up arrow'],
  loadedMore: ['20'],
  showingOf: ['20', '134'],
  lowContrast: ['4.5'],
  meterZone: ['92%', 'high'],
  progressComplete: ['Upload'],
  reorderCancelled: ['Apollo', 2, 5],
  reorderDropped: ['Apollo', 2, 5],
  reorderGrabbed: ['Apollo', 2, 5],
  reorderMoved: ['Apollo', 2, 5],
  slideOf: [2, 5],
  slidesOf: [1, 3, 7],
  sparklineSummary: ['Revenue', '12', '18', '9', '21'],
  stepOf: [2, 5],
  tableSorted: ['Amount', 'ascending'],
  toastShortcut: ['F8'],
};
function said(set: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(set).map(([k, v]) => {
    if (typeof v !== 'function') return [k, String(v)];
    const fn = v as (...a: unknown[]) => unknown;
    const text = String(fn(...(ARGS[k] || Array.from({ length: fn.length }, () => 3))));
    if (/undefined|NaN|\[object/.test(text)) throw new Error(`labels.test.tsx: "${k}" says "${text}" with 3 for each argument; add sample arguments for it to ARGS`);
    return [k, text];
  }));
}
// Words that are the same in both languages. "Slide" and "Format" are the usual loanwords in Indonesian, and
// Indonesian writes PDF, Audio and Video too (Attachment's kinds). cascadePath only joins the names it's given.
const SAME = new Set(['menu', 'ok', 'hexCode', 'sliderMinimum', 'slideRole', 'formatHint', 'attachmentPdf', 'attachmentAudio', 'attachmentVideo', 'cascadePath', 'agendaView']);
// English labels left empty on purpose: invalidValue's "" keeps the browser's own message, already in its user's language.
const EMPTY_IN_EN = new Set(['invalidValue']);

describe('labels', () => {
  const en = said(DEFAULT_LABELS as unknown as Record<string, unknown>), id = said(idLabels as unknown as Record<string, unknown>);
  test('the two sets have the same keys', () => {
    expect(Object.keys(id).sort()).toEqual(Object.keys(en).sort());
  });
  test('no label is empty, untrimmed, or has doubled punctuation or spaces', () => {
    const bad = (set: Record<string, string>) => Object.entries(set).filter(([, t]) => !t.trim() || t !== t.trim() || /\.\.(?!\.)|\.\s*\.|,\s*[,.]|\s[,.:;!?]|\s{2}|\.…|…\./.test(t)).map(([k, t]) => k + ': ' + t);
    const enSaid = Object.fromEntries(Object.entries(en).filter(([k]) => !EMPTY_IN_EN.has(k)));
    expect([bad(enSaid), bad(id)]).toEqual([[], []]);
  });
  // GR165: one apostrophe and one pair of quotes in every label, the typographic ones (’ “ ”), so "Couldn’t save" and
  // "Couldn't copy" don't look different on the same page.
  test('apostrophes and quotes are curly in both sets', () => {
    const straight = (set: Record<string, string>) => Object.entries(set).filter(([, t]) => /['"]/.test(t)).map(([k, t]) => k + ': ' + t);
    expect([straight(en), straight(id)]).toEqual([[], []]);
  });
  test('no Indonesian label is still in English', () => {
    expect(Object.keys(en).filter((k) => !SAME.has(k) && en[k] === id[k] && /[a-z]{3}/i.test(en[k])).map((k) => k + ': ' + en[k])).toEqual([]);
  });
});

// GR205: blocks and patterns keep their own words in their source, not in the label sets, so the test above doesn't
// see them. Every string they show ("…", '…' or `…` in code, or text between JSX tags) uses the curly apostrophe too.
// Comments and developer warnings (warnOnce) are left out.
const PARTS = import.meta.glob<string>(['../blocks/*/*.tsx', '../patterns/*/*.tsx', '!../**/*.test.tsx', '!../**/*.stories.tsx'], { eager: true, query: '?raw', import: 'default' });
test('blocks and patterns show curly apostrophes', () => {
  const found: string[] = [];
  for (const [file, src] of Object.entries(PARTS)) {
    let inComment = false;
    src.split('\n').forEach((line, i) => {
      const t = line.trim();
      if (inComment) { inComment = !t.includes('*/'); return; }
      if (t.startsWith('/*')) { inComment = !t.includes('*/'); return; }
      if (t.startsWith('//') || t.startsWith('*') || line.includes('warnOnce')) return;
      const code = line.replace(/\s\/\/ .*$/, '');
      if (/"[^"]*[A-Za-z]'[A-Za-z][^"]*"|`[^`]*[A-Za-z]'[A-Za-z][^`]*`|[>}][^<>{}]*[A-Za-z]'[A-Za-z][^<>{}]*[<{]/.test(code)) found.push(file.replace('../', '') + ':' + (i + 1) + ': ' + t);
    });
  }
  expect(found).toEqual([]);
});
