// Fonts and line heights by script (143, tokens.json's type.scripts). Checks, in Chromium with tokens.css:
//   - the sans stack names Noto Sans Arabic, Hebrew, Devanagari and Thai after Inter, so any lang draws them;
//   - lang="ja", "ko", "zh" (and zh-CN) and "zh-TW" (and zh-Hant) put their own CJK font first after Inter, as Han
//     characters are drawn differently in each, and a nested lang wins over the page's;
//   - text the way components set it (font-size: var(--text-sm); line-height: var(--text-sm--line-height)) is at least
//     1.6 times its size in Arabic and 1.5 in Devanagari, Thai and CJK, and the same as before in English and Hebrew;
//     a line height already taller (text-base in Thai, 24px) is kept.
//   node tools/test/script-fonts.mjs
import { read, browser, report, done, servePages } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const scripts = JSON.parse(read('tokens.json')).type.scripts || [];
t('tokens.json gives Arabic, Devanagari, Thai, Japanese, Korean and both Chinese a line height', ['Arabic', 'Devanagari', 'Thai', 'Japanese', 'Korean', 'Simplified Chinese', 'Traditional Chinese'].every((n) => scripts.some((s) => s.script === n && s.lineHeight)), scripts.map((s) => s.script).join(', '));

const pages = servePages('scripts');
const CASES = [
  // [lang, size token, expected line height in px, font that must come right after "Inter Fallback"]
  ['en', 'sm', 20, 'Noto Sans Arabic'],
  ['he', 'sm', 20, 'Noto Sans Arabic'],
  ['ar-EG', 'sm', 22.4, 'Noto Sans Arabic'],
  ['fa', 'xs', 19.2, 'Noto Sans Arabic'],
  ['hi', 'sm', 21, 'Noto Sans Arabic'],
  ['th', 'sm', 21, 'Noto Sans Arabic'],
  ['th', 'base', 24, 'Noto Sans Arabic'],
  ['th', '5xl', 72, 'Noto Sans Arabic'],
  ['ja', 'sm', 21, 'Noto Sans JP'],
  ['ko', 'sm', 21, 'Noto Sans KR'],
  ['zh', 'sm', 21, 'Noto Sans SC'],
  ['zh-CN', 'sm', 21, 'Noto Sans SC'],
  ['zh-TW', 'sm', 21, 'Noto Sans TC'],
  ['zh-Hant-HK', 'sm', 21, 'Noto Sans TC'],
];
const body = CASES.map(([lang, size], i) => `<div lang="en"><p id="c${i}" lang="${lang}" style="font-family:var(--font-sans);font-size:var(--text-${size});line-height:var(--text-${size}--line-height)">x</p></div>`).join('');
const page = pages.write('page.html', `<!doctype html><html lang="en"><meta charset="utf-8"><link rel="stylesheet" href="${pages.at('tokens.css')}"><body>${body}`);

const b = await browser();
const p = await b.newPage();
await p.goto(page);
const got = await p.evaluate((n) => Array.from({ length: n }, (_, i) => {
  const s = getComputedStyle(document.getElementById('c' + i));
  return { lh: parseFloat(s.lineHeight), family: s.fontFamily };
}), CASES.length);
await b.close();
pages.close();

CASES.forEach(([lang, size, lh, next], i) => {
  const g = got[i];
  // The families one by one, unquoted: Chromium quotes a name with a space ("Inter Fallback"), Safari doesn't.
  const fam = g.family.split(',').map((f) => f.trim().replace(/^"(.*)"$/, '$1'));
  const after = fam[1] === 'Inter Fallback' ? fam[2] : undefined;
  t(`lang="${lang}": text-${size} has a ${lh}px line height`, Math.abs(g.lh - lh) < 0.05, `${g.lh}px`);
  t(`lang="${lang}": ${next} comes right after Inter`, fam[0] === 'Inter' && after === next, g.family);
});

done(report('Fonts by script', R));
