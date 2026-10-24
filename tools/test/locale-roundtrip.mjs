// Round trips in Node's own ICU (the component tests cover the browser's): every date and time a component shows,
// in about a hundred locales, reads back as the same value. Kyrgyz writes year-day-month, Bulgarian and Dzongkha
// write words around a time, Assamese puts AM first, and the Japanese calendar's 12-hour clock starts at 0.
//   node tools/test/locale-roundtrip.mjs   (after npm run build)
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PROJECT, report, done } from './lib.mjs';
import { WORLD_LOCALES } from './vitest/locales.ts';

const mod = (f) => import(pathToFileURL(path.join(PROJECT, 'dist', 'js', 'internal', f)).href);
const { formatTime, parseTime } = await mod('times.js');
const { formatDate, parseDate } = await mod('dates.js');

const R = [];
const times = [], dates = [];
for (const l of WORLD_LOCALES) {
  for (const n of [0, 5, 570, 720, 765, 845, 1439]) for (const h of [undefined, true, false]) {
    const t = formatTime(n, l, h);
    if (parseTime(t, l) !== n) times.push(`${l} ${h} "${t}" → ${parseTime(t, l)}`);
  }
  for (const d of [new Date(2001, 10, 22), new Date(2026, 0, 5), new Date(2024, 1, 29), new Date(1999, 11, 31)]) {
    const t = formatDate(d, l);
    if (parseDate(t, l)?.toDateString() !== d.toDateString()) dates.push(`${l} "${t}" → ${parseDate(t, l)?.toDateString()}`);
  }
}
R.push({ name: `every time reads back in ${WORLD_LOCALES.length} locales (default, 12-hour and 24-hour)`, ok: !times.length, detail: times.slice(0, 8).join('; ') });
R.push({ name: `every date reads back in ${WORLD_LOCALES.length} locales`, ok: !dates.length, detail: dates.slice(0, 8).join('; ') });
done(report('Locale round trips (Node)', R));
