// Language packs (I7, 137): every serupa-ds/labels/<language> entry has every built-in word, each of the same kind as
// English's (a text or a function of the same arguments), says something for every sample (a count of 1 and of 5,
// each status, hue and reason), and isn't English where it should be translated. Run after npm run build.
//   node tools/test/label-packs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const dir = path.join(PROJECT, 'dist', 'js', 'labels');
const src = fs.readdirSync(path.join(PROJECT, 'src', 'labels')).filter((f) => f.endsWith('.ts')).map((f) => f.slice(0, -3)).sort();
const built = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort() : [];
t(`each src/labels/ file is built into dist/js/labels/ (${src.join(', ')})`, src.length >= 2 && src.join() === built.join(), `built: ${built.join(', ')}`);
const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package.json'), 'utf8'));
t('package.json exports serupa-ds/labels/* with its types', pkg.exports['./labels/*']?.types === './dist/labels/*.d.ts' && pkg.exports['./labels/*'].import === './dist/js/labels/*.js'
  && src.every((l) => fs.existsSync(path.join(PROJECT, 'dist', 'labels', l + '.d.ts'))));

const packs = Object.fromEntries(await Promise.all(built.map(async (l) => [l, await import(pathToFileURL(path.join(dir, l + '.js')).href)])));
const en = packs.en.labels;
const { enLabels, idLabels } = await import(pathToFileURL(path.join(PROJECT, 'dist', 'js', 'index.js')).href);
t('@diki-stwn/serupa-ds/labels/en and /id are enLabels and idLabels', packs.en.labels === enLabels && packs.id.labels === idLabels);

// Arguments for each function label: every case it has to word (a count of 1 and of several; each value of a union).
const reasons = ['valueMissing', 'typeMismatch', 'badInput', 'tooShort', 'tooLong', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'patternMismatch'];
const SAMPLES = {
  maskedEnding: [['Card number', '1208']], formErrorTitle: [['Sign up']], maskedHidden: [['Balance']], showValue: [['Card number']],
  avatarStatus: ['online', 'busy', 'away', 'offline'].map((s) => [s]),
  avatarMore: [[1, '1'], [5, '5']], slideOf: [[2, 5]], imageOf: [[2, 5]], slidesOf: [[1, 3, 9]], sparklineSummary: [['Revenue', '12', '18', '9', '21']], statTileUp: [['12%']], statTileDown: [['4%']], statTileTrend: [['Revenue', 8]],
  colorName: ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'brown', 'gray', 'black', 'white'].flatMap((h) => ['light', 'dark', ''].map((tone) => [h, tone])),
  contrast: [['4.5']], lowContrast: [['3']], resultsCount: [[0, '0'], [1, '1'], [5, '5']], dataGridEdit: [['Qty']], dataGridCopied: [[1], [4]], dataGridPasted: [[1], [6]], moreResults: [[1], [40]],
  clearValue: [['Size'], ['']], createOption: [['Research']], valueAdded: [['Red']], valueRemoved: [['Red']], inputNotAccepted: [['31/02']], formatHint: [['DD/MM/YYYY']],
  errorSummaryTitle: [[1, '1'], [3, '3']],
  fileWrongType: [['a.exe', ['image']], ['a.exe', ['image', 'video', 'PDF']], ['a.exe', undefined]], fileTooLarge: [['a.png', '5 MB']],
  fileTooMany: [['a.png', 1], ['a.png', 3]], fileOnlyOne: [['a.png']], fileMissing: [[true], [false]], fileFolder: [['photos']], fileAlreadyAdded: [['a.png']],
  filesAdded: [[['a.png']], [['a.png', 'b.png']]], fileRemoved: [['a.png']],
  charactersLeft: [[0], [1], [5]],
  invalidValue: reasons.map((reason) => [{ reason, type: reason === 'typeMismatch' ? 'email' : 'text', length: 3, minLength: 5, maxLength: 2, min: '1', max: '9', step: '2', title: '' }]),
  keyName: [['Up arrow'], ['Space'], ['Enter']], showingOf: [[10, 50]], loadedMore: [[1], [10]], meterZone: [['92%', 'high'], ['10%', 'low'], ['50%', 'medium']],
  itemsOf: [[1, 1, 9], [1, 10, 90]], progressComplete: [['Upload'], ['']], ratingStars: [[1], [3.5], [5]], ratingValue: [[3, 5]],
  reorderGrabbed: [['Apples', 2, 5]], reorderMoved: [['Apples', 3, 5]], reorderDropped: [['Apples', 3, 5]], reorderCancelled: [['Apples', 2, 5]],
  transferMoved: [['Name and Email', 'Chosen']],
  fieldListLimit: [['5']],
  stepOf: [[2, 4, '2', '4']], tableSorted: [['Amount', 'ascending'], ['Amount', 'descending']], tableSelected: [[1, '1'], [3, '3']], tableSelectAll: [[1240, '1,240']], tableAllSelected: [[1240, '1,240']], tableResizeColumn: [['Name']], tableRowDetails: [['Order 1001']],
  commandsCount: [[0, '0'], [1, '1'], [5, '5']],
  chartKind: [['line'], ['bar'], ['area'], ['donut']], chartShare: [['120', '25%']], chartTotal: [['480']], chartSummary: [['Line chart', 1, 1, 'Jan', 'Jan'], ['Line chart', 2, 12, 'Jan', 'Dec']], chartRange: [['Visitors', '80', 'Feb', '300', 'Nov']], chartPoint: [['Visitors', 'Jan', '120'], [null, 'Jan', '120']],
  chatNewMessages: [[1], [3]], chatThoughtFor: [[1], [12]], chatResponseOf: [[2, 3]], notificationsUnread: [[1], [2]], eventCount: [[0], [1], [3]], moreEvents: [[1], [2]], eventTime: [['9:30 AM', '10:00 AM']], eventChanged: [['Design review', 'Thursday, March 6, 2:00 PM to 3:00 PM']],
  kanbanMoveTo: [['Fix login']], kanbanCount: [['6', '5']], kanbanGrabbed: [['Fix login', 'To do', 1, 3]], kanbanMoved: [['Fix login', 'Done', 2, 5]], kanbanDropped: [['Fix login', 'Done', 2, 5]], kanbanCancelled: [['Fix login', 'To do', 1, 3]],
  cascadePath: [[['Jawa Barat', 'Kota Bandung']]], cascadeLevel: [[1], [3]], cascadeHasMore: [[false], [true]],
  statusSummary: [['99.8%', 90, 2], ['100%', 1, 0], ['97%', 30, 1]], statusDay: [['Nov 3, 2026', 'Degraded']],
  periodPlaceholder: [['month'], ['quarter'], ['year']], periodPrevious: [['month'], ['year']], periodNext: [['month'], ['year']], periodQuarter: [[4], [4, '2026']],
  filterIs: [['Status', 'Open or Closed']], filterFrom: [['Due', 'Nov 2, 2026']], filterUntil: [['Due', 'Nov 8, 2026']], filterContains: [['Title', 'bug']], filterAny: [['Status']], filterRemove: [['Status']], tagRemove: [['Design']], rangeSelected: [['Nov 3 – 8, 2026']], filterResults: [[1, '1'], [24, '24']],
  dateFieldError: [['day'], ['month'], ['year'], ['missing-day'], ['missing-month'], ['missing-year'], ['not-real', 'February 2026', 28], ['before-min', 'Jan 1, 1900'], ['after-max', 'Nov 14, 2026']],
  toastShortcut: [['F8']], moreToasts: [[2]], toastRepeated: [[3]], typePhraseFirst: [['delete']], page: [[3]],
};
// English's own invalidValue says nothing (the browser's message stays); a translation words each reason.
const SILENT_IN_ENGLISH = new Set(['invalidValue']);
// Words that are often the same in another language (a brand, an abbreviation, a loanword).
const SAME_OK = new Set(['menu', 'agendaView', 'formatHint', 'hexCode', 'keyName', 'avatarStatus', 'carouselRole', 'slideRole', 'contrast', 'ratingValue', 'moreToasts', 'sliderMinimum', 'chartPoint', 'attachmentPdf', 'cascadePath', 'chartShare', 'statusDay', 'cropZoom']);   // cropZoom: "Zoom" is the word in de, es, fr, it, nl, pt and sv

// …and in one language only: words that language shares with English.
const SAME_IN = {
  de: ['periodQuarter', 'tableDetails', 'fieldOptional', 'optional', 'sliderMaximum', 'colorName', 'codeName', 'attachmentCode', 'attachmentAudio', 'attachmentVideo'],
  es: ['generalShortcuts', 'attachmentAudio', 'chartTotal', 'formErrorTitle'],   // formErrorTitle: "Error" is the Spanish word too
  ms: ['edit', 'attachmentAudio', 'attachmentVideo'],
  nl: ['weekView', 'week', 'weekShort', 'tableDetails', 'sliderMaximum', 'codeName', 'attachmentSheet', 'attachmentDoc', 'attachmentCode', 'attachmentAudio', 'attachmentVideo', 'filterBar'],
  sv: ['sliderMaximum', 'colorName', 'attachmentVideo', 'contextualInfo'],
  fr: ['colorName', 'notificationCenter', 'notifications', 'pagination', 'sliderMaximum', 'image', 'page', 'codeName', 'attachmentImage', 'attachmentDoc', 'attachmentArchive', 'attachmentCode', 'attachmentAudio', 'chatMessage'],
  it: ['attachmentAudio', 'attachmentVideo', 'attachmentOther'],
  id: ['attachmentAudio', 'attachmentVideo', 'attachmentOther'],   // "File": the loanword Content and voice keeps, as FileUpload says
  tr: ['attachmentVideo'],
  vi: ['attachmentVideo'],
  pt: ['chartTotal'],
  cs: ['attachmentVideo', 'sliderMaximum'],
  da: ['attachmentVideo', 'chatSend', 'chatStop', 'colorName'],   // "Send" and "Stop" are the Danish verbs, "orange" the colour
  nb: ['attachmentVideo', 'chatSend', 'colorName'],
  fi: ['attachmentVideo', 'periodQuarter'],   // Q4: Finnish UIs write the quarter as English does
  hu: ['sliderMaximum'],
  ro: ['attachmentDoc', 'attachmentAudio', 'chartTotal'],
};
// Labels that turn what the caller passes into the language's own words (a key name, a kind of file, a direction).
const PASSED_MAY_CHANGE = new Set(['keyName', 'avatarStatus', 'chartKind', 'colorName', 'meterZone', 'periodPlaceholder', 'periodPrevious', 'periodNext', 'dateFieldError', 'tableSorted', 'fileWrongType', 'invalidValue', 'statusDay', 'chartSummary']);
const NUMBER_MAY_CHANGE = new Set(['ratingStars', 'cascadeLevel', 'periodQuarter']);
// contrast takes the ratio already formatted, and a pack may write its own decimal sign.
PASSED_MAY_CHANGE.add('contrast');
// English words that mean different things in different places, so a language may need two words for them.
const TERMS_MAY_DIFFER = new Set([]);
// Keys whose English word has its own sense there, so the same English may rightly take other words: a step's status
// ("Done", finished) beside a button's action, "Back" up a level, a chat's "Try again" that resends, a tab naming a
// calendar view beside a field's label, Transfer's move out of the chosen list, a date field's day of the month.
const OWN_SENSE = new Set(['chatStepDone', 'cascadeBack', 'chatRetry', 'transferRemove', 'dayView', 'weekView', 'monthView', 'dateFieldDay']);
// Languages whose dual names two of a thing without the number ("إشعاران", two notifications).
const DUAL = new Set(['ar', 'he']);
const sameOk = (l, k) => SAME_OK.has(k) || (SAME_IN[l] || []).includes(k);

const fnNoSample = Object.keys(en).filter((k) => typeof en[k] === 'function' && !SAMPLES[k]);
t('every function label has samples here', !fnNoSample.length, fnNoSample.join(', '));
for (const [l, mod] of Object.entries(packs)) {
  const L = mod.labels;
  const missing = Object.keys(en).filter((k) => !(k in L)), extra = Object.keys(L).filter((k) => !(k in en));
  const kind = Object.keys(en).filter((k) => k in L && typeof L[k] !== typeof en[k]);
  const empty = [], same = [];
  for (const k of Object.keys(en)) {
    if (!(k in L) || typeof L[k] !== typeof en[k]) continue;
    if (typeof L[k] === 'string') {
      if (!L[k].trim()) empty.push(k);
      if (l !== 'en' && L[k] === en[k] && !sameOk(l, k)) same.push(k);
      continue;
    }
    for (const args of SAMPLES[k] || []) {
      let out;
      try { out = L[k](...args); } catch (e) { empty.push(`${k}(${JSON.stringify(args)}) throws ${e.message}`); continue; }
      if (typeof out !== 'string' || (!out.trim() && !((l === 'en' || l === 'pseudo') && SILENT_IN_ENGLISH.has(k)))) empty.push(`${k}(${JSON.stringify(args)})`);
      else if (l !== 'en' && out === en[k](...args) && !sameOk(l, k) && !(l === 'pseudo' && SILENT_IN_ENGLISH.has(k))) same.push(`${k}(${JSON.stringify(args)})`);
    }
  }
  t(`${l}: all ${Object.keys(en).length} words, each a text or a function as in English, under locale "${mod.locale}"`, !missing.length && !extra.length && !kind.length && typeof mod.locale === 'string' && (l === 'pseudo' ? mod.locale === 'en-XA' : new Intl.Locale(mod.locale).language === l.split('-')[0]),
    `missing: ${missing.slice(0, 8).join(', ')}; not in English: ${extra.slice(0, 8).join(', ')}; another kind: ${kind.join(', ')}`);
  t(`${l}: every word and every sample says something`, !empty.length, empty.slice(0, 8).join('; '));
  if (l !== 'en') t(`${l}: nothing is left in English`, !same.length, same.slice(0, 10).join('; '));
}
// Automated review (RX12): what a native speaker would catch first that a machine can, run on every pack.
const sentenceEnd = /[.!?…。！？।؟]$/u;
// Greek asks with ";" (its question mark). Thai ends a sentence with a space or nothing, so a Thai text only must not
// gain a full stop English lacks.
const endsSentence = (l, x) => (l === 'el' ? /[.!…;]$/u : sentenceEnd).test(x);
const NO_FULL_STOP = new Set(['th']);
const real = Object.entries(packs).filter(([l]) => l !== 'en' && l !== 'pseudo');
const enOut = (k, args) => { try { return en[k](...args); } catch { return ''; } };
for (const [l, mod] of real) {
  const L = mod.labels, nf = new Intl.NumberFormat(mod.locale);
  const lost = [], broken = [], unformatted = [], tidy = [], ends = [], long = [], drift = [];
  const seen = new Map();
  const ellipsis = { spaced: [], tight: [] };
  for (const k of Object.keys(en)) {
    if (!(k in L) || typeof L[k] !== typeof en[k]) continue;
    if (typeof en[k] === 'string') {
      const [e, x] = [en[k], L[k]];
      if (!e.trim()) continue;
      if (x !== x.trim() || /\s{2}/.test(x)) tidy.push(k);
      if (/\.{3}/.test(x) && e.includes('…')) tidy.push(`${k} (… as ...)`);
      // An abbreviation keeps its dot ("Sem." for Wk).
      if ((NO_FULL_STOP.has(l) ? /\.$/.test(x) && !sentenceEnd.test(e) : sentenceEnd.test(e) !== endsSentence(l, x)) && !/[:：]$/.test(x) && !(/^\S{1,5}\.$/u.test(x) && e.length <= 4)) ends.push(k);
      if (x.endsWith('…')) (x.endsWith(' …') ? ellipsis.spaced : ellipsis.tight).push(k);
      // A short control word that grows past three times English's length, and past 24 characters, won't fit its button or tab.
      if (e.length <= 16 && x.length > 24 && x.length > e.length * 3) long.push(`${k} (${e.length}→${x.length})`);
      // One English word, one translation: the same English text gets the same words everywhere in a pack.
      const prev = seen.get(e);
      if (OWN_SENSE.has(k)) continue;
      if (prev && prev[1] !== x && !TERMS_MAY_DIFFER.has(e)) drift.push(`"${e}": ${prev[0]} "${prev[1]}" vs ${k} "${x}"`);
      else if (!prev) seen.set(e, [k, x]);
      continue;
    }
    for (const args of SAMPLES[k] || []) {
      let out;
      try { out = L[k](...args); } catch { continue; }   // reported above
      const eo = enOut(k, args);
      if (typeof out !== 'string') continue;
      // Nothing left over from building the text: no "#" from plural(), no undefined, NaN or [object Object].
      if (/undefined|NaN|\[object |(^|\s)#(\s|$)|\{\w+\}/.test(out)) broken.push(`${k}(${JSON.stringify(args)}) → ${out}`);
      if (out !== out.trim() || /\s{2}/.test(out)) tidy.push(`${k}(${JSON.stringify(args)})`);
      // Every name or value the caller passes and English shows is shown here too (in any script's own digits for a number).
      for (const a of args.flat()) {
        if (typeof a === 'string' && a.length > 1 && eo.includes(a) && !out.includes(a) && !PASSED_MAY_CHANGE.has(k)) lost.push(`${k}: "${a}"`);
        if (typeof a === 'number' && a >= 2 && eo.includes(String(a)) && !out.includes(String(a)) && !out.includes(nf.format(a)) && !NUMBER_MAY_CHANGE.has(k) && !(a === 2 && DUAL.has(l))) lost.push(`${k}: ${a}`);
      }
      // A count of 1,240 is written the language's way (1.240, 1 240, १,२४०), never as English's 1,240 or a bare 1240.
      const big = args.map((a) => (typeof a === 'number' && Number.isInteger(a) && a > 1 ? 1240 : a));
      if (big.some((a, i) => a !== args[i]) && enOut(k, big).includes('1,240')) {
        let o2 = '';
        try { o2 = L[k](...big); } catch { /* reported above */ }
        if (typeof o2 === 'string' && !o2.includes(nf.format(1240))) unformatted.push(`${k} → ${o2}`);
      }
    }
  }
  t(`${l}: placeholders: every name and number the caller passes is kept`, !lost.length, [...new Set(lost)].slice(0, 10).join('; '));
  t(`${l}: plurals and formats: no "#", undefined or NaN left in a text`, !broken.length, broken.slice(0, 6).join('; '));
  t(`${l}: numbers: a count is grouped the ${mod.locale} way (${nf.format(1240)})`, !unformatted.length, unformatted.slice(0, 6).join('; '));
  if (ellipsis.spaced.length && ellipsis.tight.length) tidy.push(`… with a space in ${ellipsis.spaced.join(', ')} but not in ${ellipsis.tight.join(', ')}`);
  t(`${l}: tidy: no doubled or edge spaces, … not ..., one way of spacing …`, !tidy.length, tidy.slice(0, 10).join(', '));
  t(`${l}: a sentence ends like a sentence, and a label doesn't gain a full stop`, !ends.length, ends.slice(0, 12).join(', '));
  t(`${l}: length: no short control word grows past 3× English (overflow risk)`, !long.length, long.slice(0, 10).join(', '));
  t(`${l}: terms: the same English words are translated the same way`, !drift.length, drift.slice(0, 6).join('; '));
}
// The pseudo-locale: each word between ⟦ ⟧ and at least 40% longer than English, and a name a label is given stays.
if (packs.pseudo) {
  const P = packs.pseudo.labels;
  const short = Object.keys(en).filter((k) => typeof en[k] === 'string' && en[k].trim() && !(P[k].startsWith('⟦') && P[k].endsWith('⟧') && P[k].length - 2 >= en[k].length * 1.4));
  t('pseudo: every text word is between ⟦ ⟧ and at least 40% longer than English', !short.length, short.slice(0, 8).join(', '));
  t('pseudo: a name or count a label is given stays as it was', P.fileRemoved('Report.pdf').includes('Report.pdf') && P.itemsOf('21', '30', '1,245').includes('1,245') && packs.pseudo.pseudo('Save') === '⟦Šááṽéé⟧',
    `${P.fileRemoved('Report.pdf')} · ${P.itemsOf('21', '30', '1,245')} · ${packs.pseudo.pseudo('Save')}`);
}
// Every pack honors the formatted value/max passed to ratingStars and ratingValue (instead of ignoring them and printing ASCII digits).
const badRating = Object.entries(packs)
  .filter(([l, mod]) => l !== 'pseudo' && (!mod.labels.ratingStars(2.5, '2,5').includes('2,5') || !mod.labels.ratingValue(4.5, 5, '4,5', '5').includes('4,5')))
  .map(([l, mod]) => `${l}: ${mod.labels.ratingStars(2.5, '2,5')} / ${mod.labels.ratingValue(4.5, 5, '4,5', '5')}`);
t('every pack honors formatted numbers in ratingStars and ratingValue', !badRating.length, badRating.join('; '));
if (packs.ar) {
  const ar = packs.ar.labels;
  t('ar: chatThoughtFor and statusSummary use Arabic CLDR plural forms (dual, few, many)',
    ar.chatThoughtFor(2).includes('ثانيتان') && ar.chatThoughtFor(3).includes('ثوانٍ') && ar.chatThoughtFor(12).includes('ثانية')
      && ar.statusSummary('99%', 2, 2).includes('يومان') && ar.statusSummary('99%', 2, 2).includes('حادثتان')
      && ar.statusSummary('99%', 3, 3).includes('أيام') && ar.statusSummary('99%', 3, 3).includes('حوادث'),
    `${ar.chatThoughtFor(2)} | ${ar.chatThoughtFor(3)} | ${ar.statusSummary('99%', 2, 2)}`);
  t('ar: Latin caller text is bidi-isolated with FSI…PDI',
    ar.fileTooLarge('report-v2.pdf', '10 MB').includes('\u2068report-v2.pdf\u2069')
      && ar.tagRemove('Design').includes('\u2068Design\u2069')
      && !ar.tagRemove('تصميم').includes('\u2068'),
    `${ar.fileTooLarge('report-v2.pdf', '10 MB')} | ${ar.tagRemove('Design')}`);
  t('ar: counted nouns use CLDR dual/few/many forms',
    ar.filterResults(2).includes('نتيجتان') && ar.charactersLeft(2).includes('حرفان')
      && ar.notificationsUnread(2).includes('إشعاران') && ar.tableSelected(2).includes('عنصران')
      && ar.dataGridCopied(2).includes('خليتين') && ar.dataGridPasted(3).includes('خلايا'),
    `${ar.filterResults(2)} | ${ar.charactersLeft(2)} | ${ar.tableSelected(2)}`);
}
done(report('Label packs', R));
