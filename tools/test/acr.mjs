// Accessibility Conformance Report (18, 162): docs/acr.json, which the Accessibility statement page shows as VPAT
// 2.5's table, lists every WCAG 2.2 success criterion at levels A and AA once, with its own name and level, in
// order, and one of VPAT's conformance terms; each has remarks, and a criterion the package doesn't fully support
// says why. Its review can't be for a version newer than the package. The statement's page reads it too.
//   node tools/test/acr.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const acr = JSON.parse(fs.readFileSync(path.join(PROJECT, 'docs', 'acr.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
// WCAG 2.2's success criteria at A and AA (4.1.1 Parsing was removed in 2.2).
const WCAG = `1.1.1 A Non-text Content|1.2.1 A Audio-only and Video-only (Prerecorded)|1.2.2 A Captions (Prerecorded)|1.2.3 A Audio Description or Media Alternative (Prerecorded)|1.2.4 AA Captions (Live)|1.2.5 AA Audio Description (Prerecorded)|1.3.1 A Info and Relationships|1.3.2 A Meaningful Sequence|1.3.3 A Sensory Characteristics|1.3.4 AA Orientation|1.3.5 AA Identify Input Purpose|1.4.1 A Use of Color|1.4.2 A Audio Control|1.4.3 AA Contrast (Minimum)|1.4.4 AA Resize Text|1.4.5 AA Images of Text|1.4.10 AA Reflow|1.4.11 AA Non-text Contrast|1.4.12 AA Text Spacing|1.4.13 AA Content on Hover or Focus|2.1.1 A Keyboard|2.1.2 A No Keyboard Trap|2.1.4 A Character Key Shortcuts|2.2.1 A Timing Adjustable|2.2.2 A Pause, Stop, Hide|2.3.1 A Three Flashes or Below Threshold|2.4.1 A Bypass Blocks|2.4.2 A Page Titled|2.4.3 A Focus Order|2.4.4 A Link Purpose (In Context)|2.4.5 AA Multiple Ways|2.4.6 AA Headings and Labels|2.4.7 AA Focus Visible|2.4.11 AA Focus Not Obscured (Minimum)|2.5.1 A Pointer Gestures|2.5.2 A Pointer Cancellation|2.5.3 A Label in Name|2.5.4 A Motion Actuation|2.5.7 AA Dragging Movements|2.5.8 AA Target Size (Minimum)|3.1.1 A Language of Page|3.1.2 AA Language of Parts|3.2.1 A On Focus|3.2.2 A On Input|3.2.3 AA Consistent Navigation|3.2.4 AA Consistent Identification|3.2.6 A Consistent Help|3.3.1 A Error Identification|3.3.2 A Labels or Instructions|3.3.3 AA Error Suggestion|3.3.4 AA Error Prevention (Legal, Financial, Data)|3.3.7 A Redundant Entry|3.3.8 AA Accessible Authentication (Minimum)|4.1.2 A Name, Role, Value|4.1.3 AA Status Messages`
  .split('|').map((x) => { const [id, level, ...name] = x.split(' '); return { id, level, name: name.join(' ') }; });
const TERMS = ['Supports', 'Partially Supports', 'Does Not Support', 'Not Applicable', 'Not Evaluated'];
const got = acr.criteria;
const wrong = WCAG.filter((w, i) => got[i]?.id !== w.id || got[i].level !== w.level || got[i].name !== w.name);
t(`all ${WCAG.length} WCAG 2.2 A and AA criteria, once each, in order, with their names and levels`, got.length === WCAG.length && !wrong.length,
  wrong.slice(0, 4).map((w) => `${w.id} ${w.name} (${w.level})`).join('; ') || `${got.length} listed`);
const badTerm = got.filter((c) => !TERMS.includes(c.conformance));
t(`each says one of VPAT's terms (${TERMS.join(', ')})`, !badTerm.length, badTerm.map((c) => `${c.id}: ${c.conformance}`).join(', '));
const bare = got.filter((c) => !c.remarks || c.remarks.trim().length < 20);
t('each has remarks: how it\'s met, or why it isn\'t, or whose it is', !bare.length, bare.map((c) => c.id).join(', '));
const major = (v) => Number(String(v).split('.')[0]);
t(`reviewed for a version that exists (${acr.reviewed?.version} on ${acr.reviewed?.date}, package ${pkg.version})`,
  /^\d+\.\d+\.\d+$/.test(acr.reviewed?.version || '') && /^\d{4}-\d{2}-\d{2}$/.test(acr.reviewed?.date || '') && major(acr.reviewed.version) <= major(pkg.version));
// The remarks name files and checks: they must exist.
const named = got.flatMap((c) => [...c.remarks.matchAll(/`(tools\/[\w./-]+)`/g)].map((m) => m[1]));
const gone = named.filter((f) => !fs.existsSync(path.join(PROJECT, f)));
t('every file the remarks name exists', !gone.length, gone.join(', '));
done(report('Conformance report', R));
