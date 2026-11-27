// Real screen readers (I9): VoiceOver on macOS with WebKit, NVDA on Windows with Chromium, driven by Guidepup.
// Each case renders components from the built IIFE on a plain page, moves with the keys a screen reader user
// presses, and checks that what the screen reader says names the control, its role and its state. The words are
// matched loosely (each expected word somewhere in what was said, any case, "a|b" for either wording: NVDA says
// "check box" where VoiceOver says "checkbox"), because each reader words things its own way and changes the wording
// between versions; a missing name, role or state is what fails. A reader can speak in parts (NVDA names the tab list
// as focus enters it, then the tab), so each step listens until every word has come or 5 seconds have passed.
// It needs a machine with the screen reader set up for automation (npx @guidepup/setup), so it runs in the nightly
// screen-reader workflow, not in CI or the checks project. Everything that was said is written to
// .test-tmp/screen-reader-<reader>.txt for the run's artifact.
//   npm run build && node tools/test/screen-reader.mjs            (VoiceOver on macOS, NVDA on Windows)
//   node tools/test/screen-reader.mjs --only Slider,Alert         (just these, by the name before the case's colon)
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, writePage, report, done, fail } from './lib.mjs';

const reader = process.platform === 'darwin' ? 'voiceover' : process.platform === 'win32' ? 'nvda' : null;
if (!reader) fail('Screen readers run on macOS (VoiceOver) or Windows (NVDA): this check runs in the nightly screen-reader workflow.');
if (!fs.existsSync(path.join(PROJECT, 'dist', 'serupa.iife.js'))) fail('Build first: npm run build');

const { voiceOver, nvda, macOSActivate } = await import('@guidepup/guidepup');
const { webkit, chromium } = await import('playwright');
const sr = reader === 'voiceover' ? voiceOver : nvda;
const engine = reader === 'voiceover' ? webkit : chromium;

// [name, the page's React tree (h is React.createElement, S is Serupa), the steps, what each step must say]
// A step is a key to press through the screen reader. The page starts with focus on the "Start" button before the case.
const CASES = [
  ['Button: name and role', "h(S.Button, null, 'Save draft')", [['Tab', ['save draft', 'button']]]],
  ['Checkbox: name, role and state, and the new state on Space', "h(S.Checkbox, null, 'Email me updates')",
    [['Tab', ['email me updates', 'checkbox|check box']], ['Space', ['checked']]]],
  ['Switch: name, role and state', "h(S.Switch, null, 'Quiet hours')", [['Tab', ['quiet hours', 'switch']]]],
  ['Tabs: the selected tab, its role and its place in the set; an arrow moves to the next one',
    "h(S.Tabs, { defaultValue: 'a' }, h(S.TabList, { 'aria-label': 'Project' }, h(S.Tab, { value: 'a' }, 'Overview'), h(S.Tab, { value: 'b' }, 'Activity')), h(S.TabPanel, { value: 'a' }, 'All good'), h(S.TabPanel, { value: 'b' }, 'Nothing new'))",
    [['Tab', ['overview', 'tab', 'selected']], ['ArrowRight', ['activity', 'tab']]]],
  ['Dialog: opening it says its title and that it is a dialog',
    "h(function () { var s = React.useState(false); return h(React.Fragment, null, h(S.Button, { onClick: function () { s[1](true); } }, 'Invite people'), h(S.Dialog, { open: s[0], onOpenChange: s[1], title: 'Invite people', description: 'They get an email with a link.' }, h(S.Button, null, 'Send'))); })",
    [['Tab', ['invite people', 'button']], ['Enter', ['invite people', 'dialog']]]],
  ['Combobox: name and role, and the highlighted option as the arrow moves through the list',
    "h(S.Combobox, { 'aria-label': 'Favorite fruit', options: ['Apple', 'Banana', 'Cherry'] })",
    [['Tab', ['favorite fruit', 'combo box|combobox']], ['ArrowDown', ['apple']], ['ArrowDown', ['banana']]]],
  ['Menu: the trigger is a button that opens a menu; opening it lands on the first item, an arrow on the next',
    "h(S.Menu, { trigger: h(S.Button, null, 'Row actions') }, h(S.MenuItem, null, 'Rename'), h(S.MenuItem, null, 'Archive'))",
    [['Tab', ['row actions', 'button']], ['Enter', ['rename']], ['ArrowDown', ['archive']]]],
  ['Toast: a message that appears is read out, with focus left where it was',
    "h(React.Fragment, null, h(S.Toaster), h(S.Button, { onClick: function () { S.toast('Changes saved'); } }, 'Save changes'))",
    [['Tab', ['save changes', 'button']], ['Enter', ['changes saved']]]],
  ['DatePicker: the field by its name, then the calendar button, which opens a dialog',
    "h(S.DatePicker, { 'aria-label': 'Due date', locale: 'en-US' })",
    [['Tab', ['due date']], ['Tab', ['choose a date', 'button']], ['Enter', ['choose a date', 'dialog']]]],
  ['RadioGroup: the checked radio, its role and state; an arrow checks the next one',
    "h(S.RadioGroup, { 'aria-label': 'Plan', defaultValue: 'free' }, h(S.Radio, { value: 'free' }, 'Free'), h(S.Radio, { value: 'pro' }, 'Pro'))",
    [['Tab', ['free', 'radio', 'checked|selected']], ['ArrowDown', ['pro', 'checked|selected']]]],
  ['Select: name and role of the native select',
    "h(S.Select, { 'aria-label': 'Country', options: ['Indonesia', 'Japan', 'Kenya'] })",
    [['Tab', ['country', 'combo box|combobox|pop-up|popup|menu button']]]],
  ['Slider: name, role and value; an arrow says the new value',
    "h(S.Slider, { 'aria-label': 'Volume', defaultValue: 50 })",
    [['Tab', ['volume', 'slider', '50']], ['ArrowRight', ['51']]]],
  ['Accordion: the header is a button that says whether it is open, and opening it says so',
    "h(S.Accordion, null, h(S.AccordionItem, { value: 'shipping', title: 'How long does shipping take?' }, 'Orders ship within 2 business days.'))",
    [['Tab', ['shipping', 'button', 'collapsed']], ['Enter', ['expanded']]]],
  ['Field: a required field with an error says its name, that it is invalid, and the error',
    "h(S.Field, { label: 'Email', required: true, error: 'Enter an email address like name@example.com' }, h(S.Input, { type: 'email' }))",
    [['Tab', ['email', 'invalid', 'enter an email address']]]],
  ['Alert: a danger alert that appears is read out at once, with focus left where it was',
    "h(function () { var s = React.useState(false); return h(React.Fragment, null, h(S.Button, { onClick: function () { s[1](true); } }, 'Pay now'), s[0] ? h(S.Alert, { tone: 'danger', title: 'Payment failed' }, 'Your card was declined.') : null); })",
    [['Tab', ['pay now', 'button']], ['Enter', ['payment failed']]]],
];

// --only (or SERUPA_SR_ONLY, from the workflow's input) reads just the named components, for a quick run on demand.
const onlyArg = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : process.env.SERUPA_SR_ONLY;
const only = (onlyArg || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
const unknown = only.filter((o) => !CASES.some(([name]) => String(name).split(':')[0].toLowerCase() === o));
if (unknown.length) fail(`No screen reader case for ${unknown.join(', ')}: the names are ${CASES.map(([name]) => String(name).split(':')[0]).join(', ')}.`);
const run = only.length ? CASES.filter(([name]) => only.includes(String(name).split(':')[0].toLowerCase())) : CASES;

const said = [];
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

// Guidepup keeps only a reader's first "page" of speech by default: NVDA's "Project, tab control" without the tab
// it then names. capture: true keeps all of it.
await sr.start({ capture: true });
const b = await engine.launch({ headless: false });
// One window for every case: a new window for each left every second one without the keyboard (VoiceOver heard Tab
// land on Start, the page's first control, in Checkbox and Tabs), as macOS gave focus back and forth on each close.
const page = await b.newPage();
try {
  for (const [i, [name, tree, steps]] of run.entries()) {
    const url = writePage('screen-reader.html', `<button id="start">Start</button><div id="root"></div><script>
var h = React.createElement, S = Serupa;
ReactDOM.createRoot(document.getElementById('root')).render(${tree});</script>`, { react: true });
    await page.goto(`${url}?case=${i}`);
    await page.bringToFront();
    // VoiceOver's keys go to the frontmost app, and Playwright's WebKit starts in the background ("Playwright is
    // launched in the background"): every key went to the desktop, and every case failed. Bring the app forward
    // (Guidepup names it "Playwright"), then put VoiceOver's cursor in the page.
    if (reader === 'voiceover') {
      await macOSActivate('Playwright');
      await page.locator('body').focus();
      // Interacting nests: the page reloads in the same window, so VoiceOver was still inside the last case's web
      // content, and a second interact went a level deeper. Every second case (Checkbox and Tabs) then heard "You
      // are currently on a button, inside of web content" and Tab never left Start. Each case starts one level out.
      if (i > 0) await voiceOver.stopInteracting();
      await voiceOver.interact();
    }
    await page.waitForTimeout(500);
    await page.focus('#start');
    const misses = [];
    for (const [key, words] of steps) {
      // Let the reader finish what it is saying (VoiceOver reads the Start button and then its usage hint) before the
      // key: a key pressed mid-hint was lost, and the log held only the hint (Checkbox and Tabs, run 43161653323).
      for (let last = '', still = 0, end = Date.now() + 8000; still < 3 && Date.now() < end;) {
        await page.waitForTimeout(400);
        const now = (await sr.spokenPhraseLog()).join(' | ');
        still = now === last ? still + 1 : 0;
        last = now;
      }
      await sr.clearSpokenPhraseLog();
      await sr.press(/** @type {string} */ (key), { capture: true });
      const missed = (heard) => /** @type {string[]} */ (words).filter((w) => !w.split('|').some((alt) => heard.toLowerCase().includes(alt)));
      let heard = '';
      for (const end = Date.now() + 5000; ;) {
        await page.waitForTimeout(400);
        heard = (await sr.spokenPhraseLog()).join(' | ');
        if (!missed(heard).length || Date.now() > end) break;
      }
      // What the reader's cursor is on, for a word the speech log lacks: VoiceOver can say an item's name and its usage
      // hint as two phrases, and the log polled after a key that moves focus into a new popup (Menu's first item on
      // Enter) kept only the hint. The item text is what the reader has for the focused control, so its name still counts.
      let item = '';
      if (missed(heard).length) { item = await sr.itemText().catch(() => ''); heard = item ? `${heard} [item: ${item}]` : heard; }
      said.push(`${name} / ${key}: ${heard}`);
      const missing = missed(heard);
      if (missing.length) misses.push(`${key}: no "${missing.join('", "')}" in "${heard}"`);
    }
    t(name, !misses.length, misses.join('; '));
  }
} finally {
  await b.close();
  await sr.stop();
  fs.mkdirSync(path.join(PROJECT, '.test-tmp'), { recursive: true });
  fs.writeFileSync(path.join(PROJECT, '.test-tmp', `screen-reader-${reader}.txt`), said.join('\n') + '\n');
}
// What was said, in the job's log too: the artifact is a download away, and a red run starts with reading this.
console.log(said.join('\n') + '\n');
done(report(`Screen reader (${reader === 'voiceover' ? 'VoiceOver, WebKit' : 'NVDA, Chromium'})`, R));
