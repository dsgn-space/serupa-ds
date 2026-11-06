// The skill eval's grader (tools/skill-eval/grade.mjs) marks what it should: a good answer passes every check, and
// each kind of mistake fails the one check that names it and no other. Every task names only components the package
// has, and every task has a dated result in tools/skill-eval/results/.
//   node tools/test/skill-eval.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';
import { CHECKS, TASKS, grade, gradeTask, startOf } from '../skill-eval/grade.mjs';
import { REVIEWS, gradeReview, sourceOf } from '../skill-eval/review.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

const GOOD = `import * as React from 'react';
import { Button, Field, Input, IconButton, Checkbox, Image, Stack } from 'serupa-ds';
export function SignIn() {
  const [email, setEmail] = React.useState('');
  return (
    <form className="p-4 gap-2" style={{ padding: 'var(--spacing-4)', opacity: 0.9, flex: 1 }}>
      <Stack gap="2">
        <Field label="Email" error={email ? undefined : 'Enter your email'}><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Checkbox label="Keep me signed in" />
        <Checkbox>Or with children</Checkbox>
        <IconButton icon={null} label="More" />
        <Image src="/a.png" alt="" />
        <input type="hidden" name="next" value="/" />
        <Button type="submit">Sign in</Button>
      </Stack>
    </form>
  );
}`;
const good = grade(GOOD, ['Field', 'Input', 'Button|Link']);
t('a good answer passes every check', CHECKS.every((c) => good[c].ok), CHECKS.filter((c) => !good[c].ok).map((c) => `${c}: ${good[c].why}`).join('; '));

// Each mistake, as one change to the good answer, and the one check it must fail.
const BAD = [
  ['parses', GOOD.replace('</form>', '</fom>')],
  ['serupa', GOOD.replace("from 'serupa-ds'", "from './ui'")],
  ['components', GOOD.replace('Button, Field, ', 'Field, ').replace(/<Button type="submit">Sign in<\/Button>/, '')],
  ['no-rebuilds', GOOD.replace('<Button type="submit">Sign in</Button>', '<button type="submit">Sign in</button>')],
  ['tokens', GOOD.replace("padding: 'var(--spacing-4)'", 'padding: 16')],
  ['tokens', GOOD.replace("padding: 'var(--spacing-4)'", "color: '#1a73e8'")],
  ['tokens', GOOD.replace('className="p-4 gap-2"', 'className="p-[12px] gap-2"')],
  ['tokens', GOOD.replace("padding: 'var(--spacing-4)'", "transition: 'opacity 200ms'")],
  ['names', GOOD.replace('label="More"', 'aria-label="More"')],
  ['names', GOOD.replace('<Image src="/a.png" alt="" />', '<img src="/a.png" />')],
  ['names', GOOD.replace('<Checkbox label="Keep me signed in" />', '<Checkbox />')],
  ['names', GOOD.replace('<Button type="submit">', '<Input placeholder="Code" /><Button type="submit">')],
  ['no-div-click', GOOD.replace('<Stack gap="2">', '<Stack gap="2"><div onClick={() => {}}>Row</div>')],
  // Widgets built by hand (PN1): a role or aria-expanded on a plain element, a day grid, a dropdown placed by hand.
  ['no-rebuilds', GOOD.replace('<Stack gap="2">', '<Stack gap="2"><div role="dialog" aria-modal="true">Sure?</div>')],
  ['no-rebuilds', GOOD.replace('<Stack gap="2">', '<Stack gap="2"><ul role="listbox"><li role="option">One</li></ul>')],
  ['no-rebuilds', GOOD.replace('<Stack gap="2">', '<Stack gap="2"><span role="tooltip">Edit</span>')],
  ['no-rebuilds', GOOD.replace('<Stack gap="2">', '<Stack gap="2"><Button aria-expanded={false}>Menu</Button><nav aria-expanded="false">Links</nav>')],
  ['no-rebuilds', GOOD.replace('export function', "const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];\nexport function")],
  ['no-rebuilds', GOOD.replace('export function', 'const last = (y: number, m: number) => new Date(y, m + 1, 0).getDate();\nexport function')],
  ['no-rebuilds', GOOD.replace('<Stack gap="2">', '<Stack gap="2"><div className="absolute top-full mt-1">Options</div>')],
  ['no-rebuilds', GOOD.replace("padding: 'var(--spacing-4)'", "position: 'absolute', top: '100%'")],
  // Words (PN5): the tells of UI text an agent wrote, in text, in text props and in toast().
  ['words', GOOD.replace('>Sign in</Button>', '>Submit</Button>')],
  ['words', GOOD.replace('>Sign in</Button>', '>{"OK"}</Button>')],
  ['words', GOOD.replace('>Sign in</Button>', '>Sign In</Button>')],
  ['words', GOOD.replace('label="Keep me signed in"', 'label="Keep me signed in!"')],
  ['words', GOOD.replace('label="Keep me signed in"', 'label="Keep me signed in 🔒"')],
  ['words', GOOD.replace("'Enter your email'", "'This field is required'")],
  ['words', GOOD.replace("'Enter your email'", "'Invalid input'")],
  ['words', GOOD.replace('<Checkbox>Or with children</Checkbox>', '<Text>Oops, that didn\'t work</Text>')],
  ['words', GOOD.replace('<Checkbox>Or with children</Checkbox>', '<Text>Click here to reset it</Text>')],
  ['words', GOOD.replace('<Checkbox>Or with children</Checkbox>', '<Text>Sign in seamlessly</Text>')],
  ['words', GOOD.replace('const [email', 'const save = () => toast("Saved!");\n  const [email')],
  ['words', GOOD.replace('const [email', 'const fail = () => toast.error("Something went wrong");\n  const [email')],
  // A second kit (KP2): a UI, icon or animation package beside Serupa, and a component that only wraps one of Serupa's.
  ['no-extras', GOOD.replace("import * as React from 'react';", "import * as React from 'react';\nimport { Mail } from 'lucide-react';")],
  ['no-extras', GOOD.replace("import * as React from 'react';", "import * as React from 'react';\nimport { motion } from 'framer-motion';")],
  ['no-extras', GOOD.replace("import * as React from 'react';", "import * as React from 'react';\nimport styled from 'styled-components';")],
  ['no-extras', GOOD.replace('export function', "const PrimaryButton = (props: React.ComponentProps<typeof Button>) => <Button variant=\"primary\" size=\"lg\" {...props} />;\nexport function")],
  ['no-extras', GOOD.replace('export function', "function AppField({ children, ...rest }: React.ComponentProps<typeof Field>) {\n  return (\n    <Field {...rest}>{children}</Field>\n  );\n}\nexport function")],
];
for (const [check, src] of BAD) {
  const r = grade(src, ['Field', 'Input', 'Button|Link']);
  // Nothing imported from serupa-ds means none of the expected components either.
  const also = { parses: CHECKS, serupa: ['components'] }[check] ?? [];
  const others = CHECKS.filter((c) => c !== check && !also.includes(c) && !r[c].ok);
  t(`a mistake fails "${check}" and nothing else (${r[check].why || 'passed'})`, !r[check].ok && !others.length,
    r[check].ok ? `"${check}" passed` : `also failed: ${others.map((c) => `${c} (${r[c].why})`).join(', ')}`);
}

// What isn't a widget built by hand: Serupa's own components with these props, a region or a status, a decorative
// absolutely placed badge, weekday names in a sentence.
const KEEP = GOOD.replace('<Stack gap="2">', `<Stack gap="2"><section role="region" aria-label="Help">Tips</section><p role="status">Saved</p>
        <Button aria-expanded={false}>Details</Button><span style={{ position: 'absolute', top: 'var(--spacing-1)' }}>New</span>
        <Text>Open Monday to Friday</Text>`);
const kept = grade(KEEP, ['Field', 'Input', 'Button|Link']);
t('a region, a status, a Serupa component with aria-expanded and a placed badge are not widgets built by hand', kept['no-rebuilds'].ok, kept['no-rebuilds'].why);

// Words that are fine: a name with a capital inside, an abbreviation, a lowercase word, a full sentence, an ellipsis,
// "!" in code, and strings that aren't UI text (classes, values, keys).
const PLAIN = GOOD.replace('<Stack gap="2">', `<Stack gap="2"><Button>Connect GitHub</Button><Button>Export PDF</Button><Heading level={2}>Open Monday to Friday</Heading>
        <Text>We couldn't save your changes. Try again.</Text><Text>Saving…</Text><Text>· Unread</Text><Text>{email !== '' ? 'Ready' : 'Empty'}</Text>
        <Badge variant="New Feature" data-x="Big Deal!">New</Badge>`).replace('const [email', 'const ok = () => toast("Invite sent");\n  const [email');
const plain = grade(PLAIN, ['Field', 'Input', 'Button|Link']);
// Not a second kit: a component that puts several Serupa parts together, one that sets props without spreading
// the caller's, React itself, and a local module.
const OWN = GOOD.replace('export function', `function EmailField(props: { value: string }) {
  return <Field label="Email"><Input {...props} /></Field>;
}
const Save = () => <Button variant="primary">Save</Button>;
export function`);
const own = grade(OWN, ['Field', 'Input', 'Button|Link']);
t('composing Serupa parts or fixing props is not a wrapper', own['no-extras'].ok, own['no-extras'].why);

t('names, abbreviations, sentences, "…" and strings that aren\'t UI text pass "words"', plain.words.ok, plain.words.why);

// A change to an existing file (KP3): graded on what it changed. The start's own faults don't count, new ones do,
// and old lines rewritten beyond the task's "edits", or a "keep" line gone, fail "surgical".
const task = (id) => TASKS.find((x) => x.id === id);
const phone = startOf(task('add-phone'))
  .replace("const [email, setEmail] = React.useState('');", "const [email, setEmail] = React.useState('');\n  const [phone, setPhone] = React.useState('');")
  .replace('onSave: (p: { name: string; email: string }) => void', 'onSave: (p: { name: string; email: string; phone: string }) => void')
  .replace('onSave({ name, email });', 'onSave({ name, email, phone });')
  .replace('<Button type="submit">', '<Field label="Phone" optional>\n          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />\n        </Field>\n        <Button type="submit">');
const tidy = (src, id) => { const r = gradeTask(src, task(id)); return CHECKS.filter((c) => !r[c].ok).map((c) => `${c} (${r[c].why})`); };
t('a change that adds only what was asked passes every check', !tidy(phone, 'add-phone').length, tidy(phone, 'add-phone').join(', '));
const requoted = phone.replace(/'/g, '"');
t('a change that also rewrites the old code fails "surgical" alone', tidy(requoted, 'add-phone').join() .startsWith('surgical') && tidy(requoted, 'add-phone').length === 1, tidy(requoted, 'add-phone').join(', '));
const legacy = startOf(task('legacy-page'));
const search = legacy.replace("import { Card, Heading, Stack, Text } from 'serupa-ds';", "import { Card, Heading, SearchInput, Stack, Text } from 'serupa-ds';")
  .replace("export function ItemsPage({ items, onNew }: { items: Item[]; onNew: () => void }) {", "export function ItemsPage({ items, onNew }: { items: Item[]; onNew: () => void }) {\n  const [q, setQ] = React.useState('');")
  .replace('<Heading level={1}>Items</Heading>', '<Heading level={1}>Items</Heading>\n        <SearchInput aria-label="Search items" value={q} onChange={(e) => setQ(e.target.value)} />')
  .replace('{items.map((item) => (', '{items.filter((item) => item.name.toLowerCase().includes(q.toLowerCase())).map((item) => (');
t("the start's own hand-built button and hex colors don't count against the change", !tidy(search, 'legacy-page').length, tidy(search, 'legacy-page').join(', '));
const migrated = search.replace("background: '#0b3d91', color: '#ffffff'", "background: 'var(--primary)', color: 'var(--on-primary)'");
t('a change that also restyles the old header fails "surgical"', tidy(migrated, 'legacy-page').some((x) => x.startsWith('surgical')), tidy(migrated, 'legacy-page').join(', '));
const newHex = search.replace('<SearchInput aria-label', '<SearchInput style={{ borderColor: \'#cccccc\' }} aria-label');
t('a new hex color in the change still fails "tokens"', tidy(newHex, 'legacy-page').some((x) => x.startsWith('tokens')), tidy(newHex, 'legacy-page').join(', '));
for (const x of TASKS.filter((x) => x.start)) {
  const r = grade(startOf(x), []);
  t(`task ${x.id}: its starting file parses`, r.parses.ok, r.parses.why);
}

// The tasks name components that exist, and have been run.
const names = new Set(fs.readdirSync(path.join(PROJECT, 'src/components')));
const exports = fs.readFileSync(path.join(PROJECT, 'src/components/Toast/index.ts'), 'utf8');
for (const task of TASKS) {
  const unknown = task.expect.flatMap((e) => e.split('|')).filter((n) => !names.has(n) && !new RegExp(`\\b${n}\\b`).test(exports));
  t(`task ${task.id}: every component it expects exists`, !unknown.length, 'not in the package: ' + unknown.join(', '));
}
const results = path.join(PROJECT, 'tools/skill-eval/results');
const runs = fs.existsSync(results) ? fs.readdirSync(results).filter((n) => /^\d{4}-\d{2}-\d{2}\.md$/.test(n)) : [];
t('the eval has at least one dated run in tools/skill-eval/results/', runs.length > 0, 'run node tools/skill-eval/run.mjs and commit its results');

// The review skill's eval (review.mjs): a review that names a planted problem under its heading finds and places it,
// one that names it elsewhere only finds it, the verdict has to match, and a clean change's review raises no alarm.
const invite = REVIEWS.find((c) => c.id === 'invite-member'), clean = REVIEWS.find((c) => !c.planted.length);
const GOOD_REVIEW = `### Must fix
1. **invite-member.tsx:52: a modal built from divs**
   Problem: focus isn't kept in it. Fix: use Dialog. If skipped: keyboard users get lost.
2. **invite-member.tsx:45: the delete IconButton has no label**
   Fix: add label="Remove member".
3. **invite-member.tsx:44: status shown by color alone**

### Should fix
1. The dot uses #16a34a. Use a token.
2. A failed invite goes away with the toast: use an Alert.
3. "OK" says nothing: "Send invite".
4. "Invite Member" should be sentence case.

Verdict: Not ready: 3 must fix, 4 should fix.`;
const g = gradeReview(GOOD_REVIEW, invite);
t('a review that names every planted problem under its heading finds and places them all', g.found.length === invite.planted.length && g.placed.length === invite.planted.length && g.verdict, JSON.stringify(g));
const loose = gradeReview('This modal should be a Dialog, and the OK button needs a verb. Looks fine otherwise.', invite);
t('one that names them without headings finds them but places none, and has no verdict', loose.found.join() === 'hand-built-dialog,ok-button' && !loose.placed.length && !loose.verdict, JSON.stringify(loose));
t('a case-sensitive pattern doesn\'t match the plain word ("dialog" isn\'t Dialog)', !gradeReview('The invite dialog is fine.', invite).found.includes('hand-built-dialog'));
t('a clean change\'s review passes with "Ready to merge" and nothing under Must fix', (() => { const r = gradeReview('No findings.\n\nVerdict: Ready to merge.', clean); return r.verdict && !r.alarm; })());
t('and fails with a Must fix heading or "Not ready"', (() => { const r = gradeReview('### Must fix\n1. x\n\nVerdict: Not ready: 1 must fix.', clean); return !r.verdict && r.alarm; })());
for (const c of REVIEWS) {
  t(`review case ${c.id}: its file exists and every pattern compiles`, (() => { try { sourceOf(c); c.planted.forEach((p) => new RegExp(p.find)); return true; } catch { return false; } })());
  // A pattern the file already matches would count as found for any review that quotes the code.
  const leak = c.planted.filter((p) => p.case && new RegExp(p.find).test(sourceOf(c)) && !['ok-button', 'submit-word'].includes(p.id)).map((p) => p.id);
  t(`review case ${c.id}: no component a fix names is already in the file`, !leak.length, leak.join(', '));
}

done(report('Skill eval grader', R));
