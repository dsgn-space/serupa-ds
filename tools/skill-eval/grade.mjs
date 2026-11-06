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
export const CHECKS = ['parses', 'serupa', 'components', 'no-rebuilds', 'tokens', 'names', 'no-div-click'];

const REBUILT = { button: 'Button', input: 'Input', select: 'Select', textarea: 'Textarea', table: 'Table', dialog: 'Dialog' };
const FIELD_CONTROLS = new Set(['Input', 'PasswordInput', 'Textarea', 'Select', 'NumberInput', 'SearchInput', 'Combobox', 'DatePicker', 'DateRangePicker', 'TimePicker', 'PhoneInput', 'PinInput', 'Slider', 'ColorPicker']);
const SELF_LABELLED = new Set(['Checkbox', 'Switch', 'Radio']);   // a label prop or children
const STILL = new Set(['div', 'span', 'li', 'tr', 'td', 'p', 'img', 'section']);
// Roles that make a plain element into a widget Serupa has: Dialog, Menu, Select/Combobox, Tabs, Tooltip, TreeView….
const WIDGET_ROLES = new Set(['dialog', 'alertdialog', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'listbox', 'option', 'combobox', 'tab', 'tablist', 'tabpanel', 'tooltip', 'tree', 'treeitem', 'grid', 'slider', 'switch', 'spinbutton']);
// A month's grid of days: the weekday initials or names written out, or the days in a month worked out by hand.
const DAY_GRID = /\[\s*['"](?:S|Su|Sun|Sunday|M|Mo|Mon|Monday)['"]\s*,\s*['"](?:M|Mo|Mon|Monday|T|Tu|Tue|Tuesday)['"]|new Date\([^()]*,[^()]*\+\s*1\s*,\s*0\s*\)/;
// Style properties whose bare numbers are not lengths.
const UNITLESS = new Set(['opacity', 'flex', 'flexGrow', 'flexShrink', 'zIndex', 'lineHeight', 'fontWeight', 'order', 'gridColumn', 'gridRow', 'aspectRatio']);
const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/i;
const RAW_LENGTH = /(?<![\w-])-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em)\b|\[\d+(?:px|rem)\]/;
const RAW_TIME = /(?<![\w-])(?:\d+(?:\.\d+)?|\.\d+)m?s\b/;

/** One answer's results: { check: { ok, why } }. `expect` is the task's component list. */
export function grade(source, expect = []) {
  const out = Object.fromEntries(CHECKS.map((c) => [c, { ok: true, why: '' }]));
  const fail = (c, why) => { if (out[c].ok) out[c] = { ok: false, why }; };
  const file = ts.createSourceFile('answer.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // Syntax errors: createSourceFile keeps them on the file (not in its public type).
  const syntax = /** @type {{ parseDiagnostics?: import('@typescript/typescript6').Diagnostic[] }} */ (/** @type {unknown} */ (file)).parseDiagnostics ?? [];
  if (syntax.length) {
    for (const c of CHECKS) out[c] = { ok: false, why: c === 'parses' ? ts.flattenDiagnosticMessageText(syntax[0].messageText, ' ') : 'did not parse' };
    return out;
  }
  const imported = new Set();
  for (const s of file.statements) {
    if (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && s.moduleSpecifier.text === 'serupa-ds') {
      const b = s.importClause?.namedBindings;
      if (b && ts.isNamedImports(b)) for (const e of b.elements) imported.add((e.propertyName ?? e.name).text);
    }
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

  const visit = (n) => {
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
      const style = a.get('style')?.initializer;
      if (style && ts.isJsxExpression(style) && style.expression && ts.isObjectLiteralExpression(style.expression)) {
        for (const p of style.expression.properties) if (ts.isPropertyAssignment(p)) styleValue(p);
      }
    }
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
      if (!(ts.isImportDeclaration(n.parent) || ts.isExternalModuleReference(n.parent))) text(n.text, 'text "' + n.text.slice(0, 40) + '"');
    }
    ts.forEachChild(n, visit);
  };
  visit(file);
  if (DAY_GRID.test(source)) fail('no-rebuilds', 'a month\'s day grid built by hand, where Serupa has Calendar and DatePicker');
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
    const runs = mine.length ? mine.map((f) => { const src = fs.readFileSync(path.join(dir, f), 'utf8'); return { results: grade(src, t.expect), lines: lines(src) }; })
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
