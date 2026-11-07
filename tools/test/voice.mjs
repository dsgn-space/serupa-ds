// Content and voice (docs/foundations.md): the words in the guides and the words the components say.
//   - READMEs, the docs and the skill leave out words that tell the reader something should be quick for them
//     ("simply", "obviously", "of course", "easy", "just add …") and loaded terms (whitelist, master/slave);
//   - every string in a labels.ts (what people read and hear) says the same, and never points by shape, color,
//     position or sound alone ("the button below", "the red field", WCAG 1.3.3);
//   - the prose joins its parts with colons, commas and full stops, not an em dash or a spaced " -- " (an en dash in a
//     range such as 50–200 stays, and so does a table cell that holds only "—");
//   - a pending changeset (.changeset/*.md, the next CHANGELOG) and the pattern code apps copy (src/patterns) name no
//     work-queue id such as "(GR95)" or "(41)": a reader can't follow one;
//   - the labels follow the rest of Content and voice: no "!", no "please" or "sorry" (nor "mohon", "maaf",
//     "silakan"), the ellipsis character rather than "...", and no full stop on a short label (three words or fewer).
// Code (fenced blocks and `inline`) and quoted examples are left out of the prose. A use that reads right goes in ALLOW, with why.
//   node tools/test/voice.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

// [file, words as they stand in it, why it's fine]
const ALLOW = [];

const DASH = /—| -- /g;
// "(GR95)", "(PT12)", "(FU1, GR151)", "(41)": letters and a number, or a two- or three-digit number, alone in brackets.
const QUEUE_ID = / \((?:[A-Z]{1,4}\d+[a-z]?|\d{2,3})(?:, (?:[A-Z]{1,4}\d+[a-z]?|\d{2,3}))*\)/g;
const PLEASE = /\b(?:please|sorry|mohon|maaf|silakan)\b/gi;
const WORDS = /\b(simply|obviously|of course|easy|easily|whitelist(?:ed|ing|s)?|blacklist(?:ed|ing|s)?|master|slave)\b|\bjust (?:add|call|change|copy|drop|import|pass|put|run|set|use|wrap|write|click|press|tap|type|enter|select)\b/gi;
const POINTING = /\b(?:button|link|field|icon|box|menu|option)s? (?:below|above|on the (?:left|right))\b|\b(?:red|green|blue|yellow|orange|gray|grey) (?:button|field|link|icon|text|one)s?\b|\b(?:round|square|circular) (?:button|icon)s?\b|\b(?:see|click|press|tap|select) (?:below|above)\b|\b(?:when|after) you hear\b|\bthe (?:sound|beep)\b/gi;

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const rel = (f) => path.relative(PROJECT, f);
const allowed = (file, text) => ALLOW.some(([f, w]) => f === file && w.toLowerCase() === text.toLowerCase());
const hits = (file, text, re) => [...text.matchAll(re)].map((m) => m[0]).filter((w) => !allowed(file, w));
const lineOf = (text, word) => text.slice(0, text.toLowerCase().indexOf(word.toLowerCase())).split('\n').length;

const walk = (dir, keep) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).map(String).filter(keep).map((f) => path.join(dir, f)) : []);
const prose = [
  ...walk(path.join(PROJECT, 'src', 'components'), (f) => /(^|[\\/])README\.md$/.test(f)),
  ...walk(path.join(PROJECT, 'docs'), (f) => /\.mdx?$/.test(f)),
  ...walk(path.join(PROJECT, 'skills'), (f) => /\.md$/.test(f)),
  ...['README.md', 'CONTRIBUTING.md', 'AGENTS.md', 'ROADMAP.md'].map((f) => path.join(PROJECT, f)).filter((f) => fs.existsSync(f)),
  // The pattern guides hold their own prose, and a pending changeset becomes CHANGELOG and the Storybook Changelog page.
  ...walk(path.join(PROJECT, 'src', 'patterns'), (f) => /\.mdx$/.test(f)),
  ...changesets(),
];
function changesets() { return walk(path.join(PROJECT, '.changeset'), (f) => /\.md$/.test(f) && f !== 'README.md'); }
const words = [], dashes = [];
for (const f of prose) {
  const code = fs.readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, ' ')).replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length));
  // Words in quotes are examples ("not just \"Invalid\"", Content and voice's own "Just add …"); the labels are checked below.
  const text = code.replace(/"[^"\n]*"|“[^”\n]*”/g, (m) => ' '.repeat(m.length));
  for (const w of hits(rel(f), text, WORDS)) words.push(`${rel(f)}:${lineOf(text, w)} "${w}"`);
  // A table cell that holds only a dash means "none", which isn't joining anything.
  for (const m of code.replace(/\|\s*—\s*(?=\|)/g, (c) => ' '.repeat(c.length)).matchAll(DASH)) dashes.push(`${rel(f)}:${code.slice(0, m.index).split('\n').length}`);
}
t(`the guides and docs (${prose.length} files) leave out "simply", "just", "obviously", "easy" and loaded terms`, !words.length,
  `${words.join('; ')}: reword it (Content and voice in docs/foundations.md), or add it to ALLOW in tools/test/voice.mjs with why it reads right`);
t('their prose joins its parts with a colon, comma or full stop, not an em dash or " -- "', !dashes.length,
  `${dashes.join('; ')}: a label and its text take a colon ("**Sizes**: each size…"), an aside takes commas or brackets`);

// Work-queue ids: the next CHANGELOG, and the pattern code an app copies (its tests and stories stay in the repo).
const ids = [];
for (const f of changesets()) for (const m of fs.readFileSync(f, 'utf8').matchAll(QUEUE_ID)) ids.push(`${rel(f)} "${m[0].trim()}"`);
for (const f of walk(path.join(PROJECT, 'src', 'patterns'), (f) => /\.tsx$/.test(f) && !/\.(test|stories)\.tsx$/.test(f))) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(QUEUE_ID)) ids.push(`${rel(f)} "${m[0].trim()}"`);
}
t('pending changesets and the pattern code name no work-queue id ("(GR95)", "(41)")', !ids.length,
  `${ids.join('; ')}: say what changed for the reader; the id belongs in the pull request`);

// The strings a labels.ts says: what's inside its quotes, outside comments.
const labelFiles = [...walk(path.join(PROJECT, 'src', 'components'), (f) => /(^|[\\/])labels\.ts$/.test(f)), path.join(PROJECT, 'src', 'internal', 'labels.ts')].filter((f) => fs.existsSync(f));
const said = [], toneHits = [];
let strings = 0;
const tone = (s) => [...(s.includes('!') ? ['"!"'] : []), ...[...s.matchAll(PLEASE)].map((m) => `"${m[0]}"`), ...(s.includes('...') ? ['"..." for "…"'] : [])];
const shortStop = (s) => /^[^.!?]+\.$/.test(s) && s.trim().split(/\s+/).length <= 3;
for (const f of labelFiles) {
  const code = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  // Single or double quotes: double only where the text holds an apostrophe (the lint's quotes rule).
  for (const [, , s] of code.matchAll(/(["'])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
    strings++;
    for (const w of [...hits(rel(f), s, WORDS), ...hits(rel(f), s, POINTING)]) said.push(`${rel(f)} "${s}" (${w})`);
    for (const w of tone(s)) toneHits.push(`${rel(f)} "${s}" (${w})`);
  }
  // A label that's a name, not a sentence: a property set straight to a short string.
  for (const [, key, , s] of code.matchAll(/^\s+(\w+): (["'])((?:(?!\2)[^\\\n]|\\.)*)\2,?\s*$/gm)) if (shortStop(s)) toneHits.push(`${rel(f)} ${key}: "${s}" (full stop)`);
}
t(`the labels (${labelFiles.length} files, ${strings} strings) name things, not their shape, color, position or sound, and leave out "just" and the rest`, !said.length && strings > 100,
  strings <= 100 ? `only ${strings} strings found: the labels.ts files moved or changed shape` : said.join('; '));

t('the labels say it plainly: no "!", "please" or "sorry", the ellipsis character, and no full stop on a short label', !toneHits.length, toneHits.join('; '));

// The patterns themselves: what they must catch, and what they must leave alone.
const bad = ['Simply drag a file', 'Just add a row', 'Obviously', 'It is easy', 'Add it to the whitelist', 'the master branch', 'Select the button below', 'Fix the red field', 'Press the round button', 'Continue when you hear the beep'];
const good = ['Not just a color', 'People just opened it', 'Drag files here', '3 characters left', 'below 4.5:1, which can be hard to read', 'Dark blue', 'Show options'];
const caught = (s) => new RegExp(WORDS.source, 'i').test(s) || new RegExp(POINTING.source, 'i').test(s);
t('the patterns catch the examples they are for', bad.every(caught), bad.filter((s) => !caught(s)).join('; '));
t('and leave ordinary words alone ("not just", "drag files here", "3 characters left")', !good.some(caught), good.filter(caught).join('; '));
const dashed = (s) => new RegExp(DASH.source).test(s.replace(/\|\s*—\s*(?=\|)/g, ''));
t('the dash check catches an em dash or " -- " joining words, and leaves a range or a "none" cell alone',
  ['**Sizes** — each size', 'never alone -- rings vanish'].every(dashed) && !['**50–200**: tinted', '| mask-type | `mask-type-alpha` | — |', 'npm run new -- <Name>'.replace(/npm.*/, '')].some(dashed));
const queued = (s) => new RegExp(QUEUE_ID.source).test(s);
t('the id check catches "(GR95)", "(PT12)", "(FU1, GR151)" and "(41)", and leaves "(WCAG 2.2)", "(320 px)" and "(1.4.10)" alone',
  ['Fix the bar (GR95).', 'Checkout (PT12):', 'lists (FU1, GR151).', 'the toast (41).'].every(queued) && !['AA (WCAG 2.2).', 'wraps (320 px).', 'reflow (1.4.10).', 'in 2026 (2026)'].some(queued));
const toned = (s) => tone(s).length > 0 || shortStop(s);
t('the label check catches "!", "please", "sorry", "mohon", "...", and "Save."; it leaves sentences and names alone',
  ['Saved!', 'Please try again', 'Sorry, that failed', 'Mohon tunggu', 'Loading...', 'Save.', 'Next page.'].every(toned)
  && !['Saved', 'Loading…', "This part of the page couldn't load.", 'Select at least one option.', 'Close'].some(toned));

done(report('Content and voice', R));
