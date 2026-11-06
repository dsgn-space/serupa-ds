// Grades what a coding agent wrote for the skill eval's tasks (tools/skill-eval/tasks.json), one TSX file per task, on
// the things the Serupa skill (skills/serupa/SKILL.md) tells an agent to do. Each check passes or fails per answer:
//   parses       the answer is TSX that parses
//   serupa       it imports from "serupa-ds"
//   components   it uses the task's expected components (an "A|B" entry takes either)
//   no-rebuilds  no native <button>, <input>, <select>, <textarea>, <table> or <dialog> where Serupa has one, and no
//                widget built by hand: a widget role (dialog, menu, listbox, tab, tooltip…) or aria-expanded on a
//                plain element, a month's day grid, or a dropdown positioned absolutely under its trigger
//   tokens       no raw colors (#hex, rgb(), hsl()), pixel sizes or durations, in style props, CSS strings or classes
//   names        every form control sits in a Field or has its own name, every IconButton has a label, every
//                picture has alt
//   no-div-click no onClick on an element that isn't interactive (div, span, li, tr, td, p, img, section)
//   words        the UI text (JSX text, text props such as label and title, toast() and announce()) follows Content
//                and voice in docs/foundations.md: no "OK", "Submit", "Yes" or "Click here" on a button, sentence
//                case, no exclamation marks, emoji, "Oops" or sales words, no "Invalid input", "This field is
//                required" or a bare "Something went wrong"
//   no-extras    no second kit beside Serupa: no import from a UI, icon, animation or CSS-in-JS package, and no local
//                component that only wraps one Serupa component to set its defaults (it returns that one element
//                with its props spread)
//   surgical     for a task that changes an existing file (its "start" in tools/skill-eval/starts/): the old lines
//                stay as they were, apart from the few the change needs ("edits"), and the old code's own faults
//                (a hand-built button, a hex color) don't count against the other checks, but new ones do
// It reads code only: it can't tell whether the page works. tools/test/skill-eval.mjs checks the grader itself.
// A folder holds one answer per task (<task>.tsx) or several runs of each (<task>.1.tsx, <task>.2.tsx…); the table
// gives each check's pass count over the runs, and the answers' mean length (and, from run.mjs's meta.json, the
// agent's mean cost, tokens and time).
//   node tools/skill-eval/grade.mjs <dir with sign-in.tsx, settings-table.tsx, …>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from '@typescript/typescript6';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TASKS = JSON.parse(fs.readFileSync(path.join(HERE, 'tasks.json'), 'utf8'));
export const CHECKS = ['parses', 'serupa', 'components', 'no-rebuilds', 'tokens', 'names', 'no-div-click', 'words', 'no-extras', 'surgical'];

const REBUILT = { button: 'Button', input: 'Input', select: 'Select', textarea: 'Textarea', table: 'Table', dialog: 'Dialog' };
const FIELD_CONTROLS = new Set(['Input', 'PasswordInput', 'Textarea', 'Select', 'NumberInput', 'SearchInput', 'Combobox', 'DatePicker', 'DateRangePicker', 'TimePicker', 'PhoneInput', 'PinInput', 'Slider', 'ColorPicker']);
const SELF_LABELLED = new Set(['Checkbox', 'Switch', 'Radio']);   // a label prop or children
const STILL = new Set(['div', 'span', 'li', 'tr', 'td', 'p', 'img', 'section']);
// Roles that make a plain element into a widget Serupa has: Dialog, Menu, Select/Combobox, Tabs, Tooltip, TreeView….
const WIDGET_ROLES = new Set(['dialog', 'alertdialog', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'listbox', 'option', 'combobox', 'tab', 'tablist', 'tabpanel', 'tooltip', 'tree', 'treeitem', 'grid', 'slider', 'switch', 'spinbutton']);
// A month's grid of days: the weekday initials or names written out, or the days in a month worked out by hand.
const DAY_GRID = /\[\s*['"](?:S|Su|Sun|Sunday|M|Mo|Mon|Monday)['"]\s*,\s*['"](?:M|Mo|Mon|Monday|T|Tu|Tue|Tuesday)['"]|new Date\([^()]*,[^()]*\+\s*1\s*,\s*0\s*\)/;
// Style properties whose bare numbers are not lengths.
// Packages that make a second kit beside Serupa: components, icons, animation, CSS-in-JS.
const EXTRAS = /^(?:@mui\/|@chakra-ui\/|antd$|@mantine\/|react-bootstrap$|@radix-ui\/|@headlessui\/|@ark-ui\/|react-aria-components$|@nextui-org\/|@heroui\/|primereact$|semantic-ui-react$|lucide-react$|react-icons(?:\/|$)|@heroicons\/|@fortawesome\/|@tabler\/icons|@phosphor-icons\/|@iconify\/react$|framer-motion$|motion(?:\/|$)|react-spring$|@react-spring\/|react-transition-group$|gsap$|styled-components$|@emotion\/|@stitches\/|@vanilla-extract\/|goober$|react-hot-toast$|sonner$|react-toastify$|react-modal$|react-select$|react-datepicker$|react-day-picker$|cmdk$|vaul$)/;

// UI text: the props that hold words, and the calls that say them.
const TEXT_PROPS = new Set(['label', 'title', 'description', 'placeholder', 'hint', 'error', 'message', 'heading', 'text', 'aria-label', 'confirmLabel', 'cancelLabel', 'actionLabel', 'emptyText']);
const SAYS = new Set(['toast', 'announce']);
const ACTIONS = new Set(['Button', 'button', 'Link', 'a', 'MenuItem', 'Tab']);
const VAGUE_ACTION = /^(?:ok|okay|submit|yes|no)$/i;
/** What's wrong with one piece of UI text, or ''. */
export function wordsWhy(s, action = false) {
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t || !/\p{L}/u.test(t)) return '';
  if (/\p{Extended_Pictographic}/u.test(t)) return `an emoji in "${t}"`;
  if (/!(?=\s|$|["')])/.test(t)) return `an exclamation mark in "${t}"`;
  if (/\boops\b/i.test(t)) return `"${t}"`;
  if (/\bclick here\b/i.test(t)) return `"${t}" says how to click, not where it goes`;
  if (action && VAGUE_ACTION.test(t)) return `a "${t}" button: say what it does`;
  if (/^invalid (?:input|value|entry|data)\.?$/i.test(t) || /\bthis field is required\b/i.test(t)) return `"${t}" doesn't say how to fix it`;
  if (/^(?:oops,? )?something went wrong\.?$/i.test(t)) return `"${t}" doesn't say what happened`;
  if (/\b(?:amazing|awesome|seamless(?:ly)?|effortless(?:ly)?|supercharge\w*|revolutionary|blazing(?:ly)? fast|unleash\w*)\b/i.test(t)) return `sales words in "${t}"`;
  // Title Case: a short label whose later words are all capitalised ("Save Changes"). A word with a capital inside
  // (GitHub, iPhone) or all capitals (PDF) is a name and doesn't count; a lowercase word makes it sentence case.
  const words = t.split(' ').filter((w) => /\p{L}/u.test(w));   // "· Unread" starts at Unread
  if (words.length <= 6 && !/[.?:;]\s/.test(t)) {
    const rest = words.slice(1).map((w) => w.replace(/^\W+|\W+$/g, '')).filter((w) => /^\p{L}+$/u.test(w) && !/\p{Lu}/u.test(w.slice(1)));
    if (rest.length && rest.every((w) => /^\p{Lu}/u.test(w))) return `"${t}" in Title Case, not sentence case`;
  }
  return '';
}

const UNITLESS = new Set(['opacity', 'flex', 'flexGrow', 'flexShrink', 'zIndex', 'lineHeight', 'fontWeight', 'order', 'gridColumn', 'gridRow', 'aspectRatio']);
const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/i;
const RAW_LENGTH = /(?<![\w-])-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em)\b|\[\d+(?:px|rem)\]/;
const RAW_TIME = /(?<![\w-])(?:\d+(?:\.\d+)?|\.\d+)m?s\b/;

/** One answer's results: { check: { ok, why } }. `expect` is the task's component list. */
export function grade(source, expect = []) {
  const out = Object.fromEntries(CHECKS.map((c) => [c, { ok: true, why: '', all: [] }]));
  const fail = (c, why) => { out[c].all.push(why); if (out[c].ok) Object.assign(out[c], { ok: false, why }); };
  const file = ts.createSourceFile('answer.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // Syntax errors: createSourceFile keeps them on the file (not in its public type).
  const syntax = /** @type {{ parseDiagnostics?: import('@typescript/typescript6').Diagnostic[] }} */ (/** @type {unknown} */ (file)).parseDiagnostics ?? [];
  if (syntax.length) {
    for (const c of CHECKS) { const why = c === 'parses' ? ts.flattenDiagnosticMessageText(syntax[0].messageText, ' ') : 'did not parse'; out[c] = { ok: false, why, all: [why] }; }
    return out;
  }
  const imported = new Set();
  for (const s of file.statements) {
    if (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && s.moduleSpecifier.text === 'serupa-ds') {
      const b = s.importClause?.namedBindings;
      if (b && ts.isNamedImports(b)) for (const e of b.elements) imported.add((e.propertyName ?? e.name).text);
    }
  }
  for (const s of file.statements) {
    if (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && EXTRAS.test(s.moduleSpecifier.text)) fail('no-extras', `imports ${s.moduleSpecifier.text} beside Serupa`);
  }
  if (!imported.size) fail('serupa', 'nothing imported from "serupa-ds"');
  const missing = expect.filter((alts) => !alts.split('|').some((a) => imported.has(a)));
  if (missing.length) fail('components', 'missing ' + missing.join(', '));

  const tagOf = (n) => n.tagName.getText(file);
  const attrs = (n) => new Map(n.attributes.properties.filter(ts.isJsxAttribute).map((a) => [a.name.getText(file), a]));
  const opening = (n) => ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
  const hasChildren = (n) => ts.isJsxElement(n) && n.children.some((c) => !ts.isJsxText(c) || c.text.trim());
  const inField = (n) => { for (let p = n.parent; p; p = p.parent) { const o = opening(p); if (o && o !== n && tagOf(o) === 'Field') return true; } return false; };

  // A panel placed by hand under its trigger: position absolute with top 100%, in a style prop or as classes.
  const dropdown = (a) => {
    const cls = a.get('className')?.initializer?.getText(file) ?? '';
    if (/\babsolute\b/.test(cls) && /\btop-full\b/.test(cls)) return true;
    const style = a.get('style')?.initializer;
    const css = style && ts.isJsxExpression(style) && style.expression ? style.expression.getText(file) : '';
    return /position\s*:\s*['"]absolute['"]/.test(css) && /top\s*:\s*['"]100%['"]/.test(css);
  };
  const styleValue = (prop) => {
    const name = prop.name?.getText(file).replace(/['"]/g, '');
    const v = prop.initializer;
    if (!v) return;
    if (ts.isNumericLiteral(v) && Number(v.text) !== 0 && !UNITLESS.has(name)) fail('tokens', `style ${name}: ${v.text}`);
    if (ts.isStringLiteral(v) && /transition|animation|duration|delay/i.test(name) && RAW_TIME.test(v.text)) fail('tokens', `style ${name}: ${RAW_TIME.exec(v.text)[0]}`);
  };
  const text = (s, where) => {
    if (RAW_COLOR.test(s)) fail('tokens', `${where}: ${RAW_COLOR.exec(s)[0]}`);
    else if (RAW_LENGTH.test(s)) fail('tokens', `${where}: ${RAW_LENGTH.exec(s)[0]}`);
    else if (RAW_TIME.test(s) && /transition|animation|duration|delay/i.test(s)) fail('tokens', `${where}: ${RAW_TIME.exec(s)[0]}`);
  };

  // The strings an expression can show: itself, either branch of a ?:, the fallback of || and ??, the end of &&.
  const shown = (e) => !e ? [] : ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e) ? [e.text]
    : ts.isParenthesizedExpression(e) || ts.isJsxExpression(e) ? shown(e.expression)
    : ts.isConditionalExpression(e) ? [...shown(e.whenTrue), ...shown(e.whenFalse)]
    : ts.isBinaryExpression(e) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(e.operatorToken.kind) ? [...shown(e.left), ...shown(e.right)]
    : ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ? shown(e.right) : [];
  const words = (list, action, where = '') => { for (const w of list) { const why = wordsWhy(w, action); if (why) return fail('words', where + why); } };

  // A wrapper: a function whose body is (or returns) one Serupa element with props spread on it, and nothing else.
  const only = (body) => {
    let e = body;
    if (ts.isBlock(body)) { const st = body.statements; if (st.length !== 1 || !ts.isReturnStatement(st[0])) return null; e = st[0].expression; }
    while (e && ts.isParenthesizedExpression(e)) e = e.expression;
    // Its children, if any, are only passed through ({children}).
    if (e && ts.isJsxElement(e) && !e.children.every((c) => ts.isJsxText(c) ? !c.text.trim() : ts.isJsxExpression(c))) return null;
    return e && (ts.isJsxSelfClosingElement(e) || ts.isJsxElement(e)) ? e : null;
  };
  const wraps = (fn) => {
    const el = fn.body && only(fn.body), o = el && opening(el);
    return o && imported.has(tagOf(o)) && o.attributes.properties.some(ts.isJsxSpreadAttribute) ? tagOf(o) : '';
  };

  const visit = (n) => {
    const fn = ts.isFunctionDeclaration(n) ? n : (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && ts.isVariableDeclaration(n.parent) ? n : null;
    const name = fn && (ts.isFunctionDeclaration(fn) ? fn.name?.text : n.parent.name.getText(file));
    if (fn && name && /^[A-Z]/.test(name) && wraps(fn)) fail('no-extras', `${name} only wraps ${wraps(fn)}: use ${wraps(fn)} directly, restyled with its tokens`);
    const o = opening(n);
    if (o) {
      const tag = tagOf(o), a = attrs(o);
      if (REBUILT[tag] && !(tag === 'input' && /["']hidden["']/.test(a.get('type')?.initializer?.getText(file) ?? ''))) fail('no-rebuilds', `<${tag}> where Serupa has ${REBUILT[tag]}`);
      if (/^[a-z]/.test(tag)) {
        const role = a.get('role')?.initializer;
        const r = role && ts.isStringLiteral(role) ? role.text : '';
        if (WIDGET_ROLES.has(r)) fail('no-rebuilds', `role="${r}" on <${tag}>, built by hand`);
        else if (a.has('aria-expanded') || a.has('aria-haspopup')) fail('no-rebuilds', `${a.has('aria-expanded') ? 'aria-expanded' : 'aria-haspopup'} on <${tag}>, a disclosure built by hand`);
        else if (dropdown(a)) fail('no-rebuilds', `<${tag}> positioned absolutely under its trigger, a dropdown built by hand`);
      }
      if (STILL.has(tag) && a.has('onClick')) fail('no-div-click', `onClick on <${tag}>`);
      const named = a.has('aria-label') || a.has('aria-labelledby');
      if (FIELD_CONTROLS.has(tag) && !named && !inField(n)) fail('names', `${tag} outside a Field, with no aria-label`);
      if (SELF_LABELLED.has(tag) && !named && !a.has('label') && !hasChildren(n) && !inField(n)) fail('names', `${tag} with no label`);
      if (tag === 'IconButton' && !a.has('label')) fail('names', 'IconButton with no label');
      if ((tag === 'img' || tag === 'Image') && !a.has('alt')) fail('names', `<${tag}> with no alt`);
      for (const [k, v] of a) if (TEXT_PROPS.has(k)) words(shown(v.initializer), ACTIONS.has(tag) && k === 'aria-label', `${k}: `);
      const style = a.get('style')?.initializer;
      if (style && ts.isJsxExpression(style) && style.expression && ts.isObjectLiteralExpression(style.expression)) {
        for (const p of style.expression.properties) if (ts.isPropertyAssignment(p)) styleValue(p);
      }
    }
    // Words: text between tags (and a string in braces there), and what toast() and announce() say.
    if ((ts.isJsxText(n) || ts.isJsxExpression(n)) && ts.isJsxElement(n.parent)) words(ts.isJsxText(n) ? [n.text] : shown(n.expression), ACTIONS.has(tagOf(n.parent.openingElement)));
    if (ts.isCallExpression(n) && SAYS.has(n.expression.getText(file).split('.')[0])) words(shown(n.arguments[0]), false);
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
      if (!(ts.isImportDeclaration(n.parent) || ts.isExternalModuleReference(n.parent))) text(n.text, 'text "' + n.text.slice(0, 40) + '"');
    }
    ts.forEachChild(n, visit);
  };
  visit(file);
  if (DAY_GRID.test(source)) fail('no-rebuilds', 'a month\'s day grid built by hand, where Serupa has Calendar and DatePicker');
  return out;
}

/** A task's starting file, or '' for a task that starts from nothing. */
export const startOf = (task) => task.start ? fs.readFileSync(path.join(HERE, 'starts', task.start), 'utf8') : '';

/** An answer graded as its task asks. For a task with a starting file, a fault the start already had is left out
 *  (one of each it had), and "surgical" counts the old lines the answer changed: more than the task's "edits", or a
 *  "keep" line gone, fails. */
export function gradeTask(source, task) {
  const out = grade(source, task.expect);
  const start = startOf(task);
  if (!start || !out.parses.ok) return out;
  const before = grade(start, []);
  for (const c of CHECKS) {
    if (['parses', 'serupa', 'components', 'surgical'].includes(c)) continue;
    const old = [...before[c].all];
    const left = out[c].all.filter((w) => { const i = old.indexOf(w); if (i < 0) return true; old.splice(i, 1); return false; });
    out[c] = { ok: !left.length, why: left[0] ?? '', all: left };
  }
  const have = new Map();
  for (const l of source.split('\n').map((x) => x.trim()).filter(Boolean)) have.set(l, (have.get(l) ?? 0) + 1);
  const gone = start.split('\n').map((x) => x.trim()).filter(Boolean).filter((l) => { const n = have.get(l) ?? 0; if (n) have.set(l, n - 1); return !n; });
  const lost = (task.keep ?? []).filter((k) => !source.includes(k));
  if (lost.length) out.surgical = { ok: false, why: `changed code the task didn't ask about: ${lost[0]}`, all: lost };
  else if (gone.length > (task.edits ?? 0)) out.surgical = { ok: false, why: `${gone.length} old lines changed where ${task.edits ?? 0} would do, such as ${gone.find((l) => !/^import /.test(l)) ?? gone[0]}`, all: gone };
  return out;
}

/** An answer's length: its lines that hold more than whitespace. */
export const lines = (source) => source.split('\n').filter((l) => l.trim()).length;

/** Every task's answers in `dir` (<id>.tsx, or <id>.<run>.tsx for several runs), graded. A task with no answer has
 *  one run that fails every check. meta.json, as run.mjs writes it, adds each run's cost, tokens and time. */
export function gradeDir(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const metaFile = path.join(dir, 'meta.json');
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
  return TASKS.map((t) => {
    const mine = files.filter((f) => new RegExp(`^${t.id}(\\.\\d+)?\\.tsx$`).test(f)).sort((x, y) => x.localeCompare(y, 'en', { numeric: true }));
    const runs = mine.length ? mine.map((f) => { const src = fs.readFileSync(path.join(dir, f), 'utf8'); return { results: gradeTask(src, t), lines: lines(src) }; })
      : [{ results: Object.fromEntries(CHECKS.map((c) => [c, { ok: false, why: 'no answer' }])), lines: 0 }];
    return { id: t.id, runs, meta: meta[t.id] ?? [] };
  });
}

const mean = (xs) => xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN;

/** A Markdown table of a mode's runs: a row per task, each check's passes over the runs, the answers' mean length and,
 *  when run.mjs measured them, the agent's mean cost, tokens and seconds. Then why each failing check failed. */
export function table(rows) {
  const n = Math.max(...rows.map((r) => r.runs.length));
  const cost = rows.some((r) => r.meta.length);
  const cols = [...CHECKS, 'Passed', 'Lines', ...(cost ? ['Cost ($)', 'Tokens', 'Seconds'] : [])];
  const cell = (r, c) => { const k = r.runs.filter((x) => x.results[c].ok).length; return k === r.runs.length ? `${k}/${r.runs.length}` : `**${k}/${r.runs.length}**`; };
  const body = rows.map((r) => {
    const passed = r.runs.reduce((s, x) => s + CHECKS.filter((c) => x.results[c].ok).length, 0);
    const out = [r.id, ...CHECKS.map((c) => cell(r, c)), `${Math.round((100 * passed) / (r.runs.length * CHECKS.length))}%`, Math.round(mean(r.runs.map((x) => x.lines)))];
    if (cost) out.push(mean(r.meta.map((m) => m.cost)).toFixed(3), Math.round(mean(r.meta.map((m) => m.tokens))), Math.round(mean(r.meta.map((m) => m.ms)) / 1000));
    return `| ${out.join(' | ')} |`;
  }).join('\n');
  const all = rows.flatMap((r) => r.runs), passed = all.reduce((s, x) => s + CHECKS.filter((c) => x.results[c].ok).length, 0);
  const why = rows.flatMap((r) => CHECKS.map((c) => {
    const reasons = [...new Set(r.runs.filter((x) => !x.results[c].ok).map((x) => x.results[c].why))];
    return reasons.length ? `- ${r.id}, ${c}: ${reasons.join('; ').replace(/[\\|]/g, '\\$&')}` : '';
  })).filter(Boolean);
  return `| Task | ${cols.join(' | ')} |\n|---|${cols.map(() => '---').join('|')}|\n${body}\n\n`
    + `**${passed} of ${all.length * CHECKS.length} checks passed (${Math.round((100 * passed) / (all.length * CHECKS.length))}%), ${n} run${n === 1 ? '' : 's'} per task; mean ${Math.round(mean(all.map((x) => x.lines)))} lines per answer.**\n`
    + (why.length ? `\nWhy checks failed:\n\n${why.join('\n')}\n` : '');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node tools/skill-eval/grade.mjs <answers dir>'); process.exit(2); }
  process.stdout.write(table(gradeDir(path.resolve(dir))));
}
