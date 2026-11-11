// The usage scanner (bin/serupa-usage.mjs, 34): which components a product renders, how often, in how many files and
// with which props; which it never uses; and the plain elements it writes where a component would do. Reads the
// component list from the build (dist/components.json), so it needs npm run build.
//   node tools/test/usage.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { usage } from '../../bin/serupa-usage.mjs';
import { PROJECT, done, report } from './lib.mjs';

const { components } = JSON.parse(fs.readFileSync(path.join(PROJECT, 'dist', 'components.json'), 'utf8'));
const files = [
  { file: 'src/App.tsx', code: `
import { Button, Card as Box, Navbar, NavbarLink } from 'serupa-ds';
import type { ButtonProps } from 'serupa-ds';
export const App = () => (
  <Box padding="none">
    <Navbar sticky brand={<a href="/">Acme</a>}><NavbarLink href="/" active>Home</NavbarLink></Navbar>
    <Button variant="ghost" onClick={() => count > 2 && go({ a: 1 })} disabled>Save</Button>
    <Button type="submit">Send</Button>
    <button className="raw">Old</button>
  </Box>
);` },
  { file: 'src/Other.jsx', code: `
import * as S from "serupa-ds";
export function Other() { return <><S.Button size="sm" /><S.Badge tone="success">New</S.Badge><img src="x.png" alt="" /></>; }` },
  { file: 'page.js', code: `
const { Button, Tooltip: Tip } = window.Serupa;
root.render(React.createElement(Button, null, 'Hi'));
const x = <Tip content="Saved" />;
if (a <button) {}` },
  { file: 'src/util.ts', code: 'export const less = (a: number, b: number) => a < b;' },
  { file: 'src/Fake.tsx', code: 'const Button = () => null; export const F = () => <Button size="lg" />;' },
];
const r = usage(files, components);
const by = (n) => r.exports.find((e) => e.name === n);

const bin = path.join(PROJECT, 'bin', 'serupa-usage.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-usage-'));
fs.mkdirSync(path.join(tmp, 'src'));
fs.mkdirSync(path.join(tmp, 'node_modules', 'x'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'src', 'App.tsx'), files[0].code);
fs.writeFileSync(path.join(tmp, 'node_modules', 'x', 'index.jsx'), files[1].code);
const text = spawnSync(process.execPath, [bin, 'src'], { cwd: tmp, encoding: 'utf8' });
const json = spawnSync(process.execPath, [bin, 'src', '--json'], { cwd: tmp, encoding: 'utf8' });
const none = spawnSync(process.execPath, [bin], { cwd: tmp, encoding: 'utf8' });
fs.rmSync(tmp, { recursive: true, force: true });
let parsed = null;
try { parsed = JSON.parse(json.stdout); } catch { /* reported below */ }

done(report('Usage scanner', [
  { name: 'counts named, renamed and namespace imports and window.Serupa, by the name each was exported as', ok: by('Button')?.uses === 3 && by('Button')?.files === 2 && by('Card')?.uses === 1 && by('Badge')?.uses === 1 && by('Tooltip')?.uses === 1, detail: JSON.stringify(r.exports) },
  { name: 'a sub-export (NavbarLink) is its own row and marks its component (Navbar) used', ok: by('NavbarLink')?.uses === 1 && !r.unused.includes('Navbar'), detail: JSON.stringify(r.unused) },
  { name: 'reads each prop once per tag, past braces and arrows inside a prop', ok: JSON.stringify(by('Button')?.props) === JSON.stringify({ disabled: 1, onClick: 1, size: 1, type: 1, variant: 1 }) && JSON.stringify(by('Navbar')?.props) === JSON.stringify({ brand: 1, sticky: 1 }), detail: JSON.stringify(by('Button')?.props) },
  { name: 'a type import, a local component of the same name, and a < comparison count for nothing', ok: r.importing === 3 && by('Button')?.uses === 3 },
  { name: 'plain elements that a component covers are counted, in JSX only', ok: JSON.stringify(r.native.map((n) => [n.element, n.uses, n.instead])) === JSON.stringify([['a', 1, 'Link'], ['button', 1, 'Button'], ['img', 1, 'Image']]), detail: JSON.stringify(r.native) },
  { name: 'every component not rendered is listed as unused', ok: r.unused.length === Object.keys(components).length - 5 && r.unused.includes('Dialog') && !r.unused.includes('Card'), detail: `${r.unused.length} unused` },
  { name: 'the command reads a folder, skips node_modules, prints a table or JSON, and asks for a path', ok: text.status === 0 && /^1 source files, 1 of them use Serupa\./.test(text.stdout) && /Button\s+2\s+1\s+/.test(text.stdout) && parsed?.files === 1 && none.status === 2, detail: text.stdout + text.stderr + none.stderr },
]));
