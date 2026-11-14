// The API report (tools/api-diff.mjs) tells breaking changes from additions, so changeset-check.mjs asks for a major
// when a project's code would stop compiling, and only then. Each case is two versions of one baseline file.
//   node tools/test/api-diff.mjs
import { report, done } from './lib.mjs';
import { bumpFor, diffApi, reportOf } from '../api-diff.mjs';

const R = [];
const t = (name, ok, detail = '') => R.push({ name, ok: !!ok, detail });
const file = (exports, body) => `// exports: ${exports}\n${body}\n`;
const props = (...members) => file('Chip, type ChipProps, type ChipTone', `type ChipTone = "danger" | "neutral";\ninterface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {\n${members.map((m) => `    ${m}\n`).join('')}}\ndeclare const Chip: React.ForwardRefExoticComponent<ChipProps & React.RefAttributes<HTMLSpanElement>>;`);
const base = props('tone?: ChipTone | undefined;', 'size?: "md" | "sm" | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;');
/** @type {[string, string, string, string, string[]][]} */
const cases = [
  ['the same file', base, base, 'patch', []],
  ['a removed prop', base, props('tone?: ChipTone | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;'), 'major', ['ChipProps.size: removed']],
  ['an optional prop made required', base, props('tone: ChipTone;', 'size?: "md" | "sm" | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;'), 'major', ['ChipProps.tone: now required']],
  ['a new required prop', base, props('tone?: ChipTone | undefined;', 'size?: "md" | "sm" | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;', 'label: string;'), 'major', ['ChipProps.label: new and required']],
  ['a value a prop no longer accepts', base, props('tone?: ChipTone | undefined;', 'size?: "md" | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;'), 'major', ['ChipProps.size: no longer accepts "sm"']],
  ['a value a type alias no longer includes', base, base.replace('"danger" | "neutral"', '"neutral"'), 'major', ['ChipTone: no longer includes "danger"']],
  ['an element prop now left out', base, base.replace('"color">', '"color" | "title">'), 'major', ['ChipProps: no longer takes the element\'s own "title"']],
  ['a removed export', base, base.replace('Chip, type ChipProps', 'type ChipProps'), 'major', ['Chip: no longer exported']],
  ['a new optional prop', base, props('tone?: ChipTone | undefined;', 'size?: "md" | "sm" | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;', 'dot?: boolean | undefined;'), 'minor', []],
  ['a new accepted value', base, props('tone?: ChipTone | undefined;', 'size?: "lg" | "md" | "sm" | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;'), 'minor', []],
  ['a literal union widened to string', base, props('tone?: ChipTone | undefined;', 'size?: string | undefined;', 'onRemove?: ((event: React.MouseEvent) => void) | undefined;'), 'minor', []],
  ['an element prop no longer left out, declared by the component', base, base.replace('"color">', '"color" | "title">').replace('    tone?', '    title?: string | undefined;\n    tone?'), 'minor', []],
  ['a new export', base, base.replace('Chip, type ChipProps', 'Chip, chipClass, type ChipProps'), 'minor', []],
  ['the same callback, printed with or without its parentheses', base, base.replace('((event: React.MouseEvent) => void) | undefined', '(event: React.MouseEvent) => void'), 'patch', []],
  ['a callback given one more argument (needs a look, not a major)', base, base.replace('(event: React.MouseEvent) => void', '(event: React.MouseEvent, id: string) => void'), 'minor', []],
];
for (const [label, was, now, want, breaking] of cases) {
  const r = diffApi(was, now);
  const got = bumpFor(r);
  t(`${label}: ${want}`, got === want && breaking.every((b) => r.breaking.some((l) => l.startsWith(b))) && (want === 'major' || !r.breaking.length), JSON.stringify(r));
}
// Labels are passed in part, so a new label never breaks a project; a removed one does (it no longer type-checks).
const labels = (...m) => file('type ChipLabels', `interface ChipLabels {\n${m.map((x) => `    ${x}\n`).join('')}}`);
t('a new label is a minor', bumpFor(diffApi(labels('remove: string;'), labels('remove: string;', 'removed: string;'))) === 'minor');
t('a removed label is a major', bumpFor(diffApi(labels('remove: string;', 'removed: string;'), labels('remove: string;'))) === 'major');
// A generic default (`<C extends React.ElementType = "a">`) isn't the alias's `=`.
const poly = (u) => file('type LinkProps', `type LinkProps<C extends React.ElementType = "a"> = ${u};`);
t('a generic alias reads its right-hand side, not the default', bumpFor(diffApi(poly('Own & { as?: C; }'), poly('Own & { as?: C; }'))) === 'patch' && bumpFor(diffApi(poly('"a" | "b"'), poly('"a"'))) === 'major');
t('the report names the bump and escapes the types', /needs a major/.test(reportOf(diffApi(base, cases[1][2]))) && !/<React/.test(reportOf(diffApi(base, cases[14][2]))));

done(report('API report', R));
