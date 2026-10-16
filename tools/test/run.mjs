// Runs the whole suite: node tools/test/run.mjs   (add --update to accept new baselines)
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { HERE, PROJECT } from './lib.mjs';

const update = process.argv.includes('--update') ? ['--update'] : [];
// --browser firefox|webkit runs the Playwright suites in that engine; --compat safari|firefox|webkitgtk adds the
// cross-browser comparison through WebDriver (see compat.mjs).
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
if (arg('--browser')) process.env.DIKI_BROWSER = arg('--browser');
const steps = [
  ['Package', 'node', [path.join(HERE, 'package.mjs')]],
  ['Foundation audit', 'python3', ['-I', path.join(HERE, 'foundation.py'), PROJECT]],
  ['Design tokens export', 'python3', ['-I', path.join(HERE, 'design_tokens.py'), PROJECT]],
  ['Style Dictionary', 'node', [path.join(HERE, 'style_dictionary.mjs')]],
  ['Utility classes', 'node', [path.join(HERE, 'utilities.mjs'), ...update]],
  ['Button behaviour', 'node', [path.join(HERE, 'button.mjs')]],
  ['Button micro-interactions', 'node', [path.join(HERE, 'button-motion.mjs')]],
  ['Loader', 'node', [path.join(HERE, 'loader.mjs')]],
  ['Badge', 'node', [path.join(HERE, 'badge.mjs')]],
  ['Card', 'node', [path.join(HERE, 'card.mjs')]],
  ['Input', 'node', [path.join(HERE, 'input.mjs')]],
  ['Textarea', 'node', [path.join(HERE, 'textarea.mjs')]],
  ['Field', 'node', [path.join(HERE, 'field.mjs')]],
  ['Select', 'node', [path.join(HERE, 'select.mjs')]],
  ['Checkbox', 'node', [path.join(HERE, 'checkbox.mjs')]],
  ['Radio', 'node', [path.join(HERE, 'radio.mjs')]],
  ['Switch', 'node', [path.join(HERE, 'switch.mjs')]],
  ['Icon builder', 'python3', ['-I', path.join(HERE, 'icons.py'), PROJECT]],
  ['Custom icons', 'node', [path.join(HERE, 'icons.mjs')]],
  ['Visual snapshots', 'node', [path.join(HERE, 'visual.mjs'), ...update]],
  ['Page groundwork', 'node', [path.join(HERE, 'page.mjs')]],
  ['Storybook', 'node', [path.join(HERE, 'storybook.mjs')]],
];
if (arg('--compat')) steps.push([`Cross-browser (${arg('--compat')})`, 'node', [path.join(HERE, 'compat.mjs'), '--engine', arg('--compat'), ...(arg('--driver') ? ['--driver', arg('--driver')] : [])]]);
const summary = [];
for (const [name, cmd, args] of steps) {
  console.log(`\n━━ ${name} ━━`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, DIKI_PROJECT: PROJECT } });
  summary.push([name, r.status === 0]);
}
console.log('\n━━ Summary ━━');
for (const [name, ok] of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
process.exit(summary.every(([, ok]) => ok) ? 0 : 1);
