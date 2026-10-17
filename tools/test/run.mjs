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
  ['Component contract', 'node', [path.join(HERE, 'contract.mjs')]],
  ['Foundation audit', 'python3', ['-I', path.join(HERE, 'foundation.py'), PROJECT]],
  ['Design tokens export', 'python3', ['-I', path.join(HERE, 'design_tokens.py'), PROJECT]],
  ['Style Dictionary', 'node', [path.join(HERE, 'style_dictionary.mjs')]],
  ['Utility classes', 'node', [path.join(HERE, 'utilities.mjs'), ...update]],
  ['Button behaviour', 'node', [path.join(HERE, 'button.mjs')]],
  ['Button micro-interactions', 'node', [path.join(HERE, 'button-motion.mjs')]],
  ['Loader', 'node', [path.join(HERE, 'loader.mjs')]],
  ['Badge', 'node', [path.join(HERE, 'badge.mjs')]],
  ['Text and Heading', 'node', [path.join(HERE, 'typography.mjs')]],
  ['Card', 'node', [path.join(HERE, 'card.mjs')]],
  ['IconButton and Fab', 'node', [path.join(HERE, 'icon-button.mjs')]],
  ['Alert', 'node', [path.join(HERE, 'alert.mjs')]],
  ['Avatar', 'node', [path.join(HERE, 'avatar.mjs')]],
  ['Tabs', 'node', [path.join(HERE, 'tabs.mjs')]],
  ['Tooltip', 'node', [path.join(HERE, 'tooltip.mjs')]],
  ['Dialog', 'node', [path.join(HERE, 'dialog.mjs')]],
  ['Menu', 'node', [path.join(HERE, 'menu.mjs')]],
  ['Toast', 'node', [path.join(HERE, 'toast.mjs')]],
  ['Layout', 'node', [path.join(HERE, 'layout.mjs')]],
  ['Link', 'node', [path.join(HERE, 'link.mjs')]],
  ['Breadcrumb', 'node', [path.join(HERE, 'breadcrumb.mjs')]],
  ['Pagination', 'node', [path.join(HERE, 'pagination.mjs')]],
  ['Table', 'node', [path.join(HERE, 'table.mjs')]],
  ['Accordion', 'node', [path.join(HERE, 'accordion.mjs')]],
  ['Navbar', 'node', [path.join(HERE, 'navbar.mjs')]],
  ['Sidebar', 'node', [path.join(HERE, 'sidebar.mjs')]],
  ['ButtonGroup', 'node', [path.join(HERE, 'button-group.mjs')]],
  ['PasswordInput', 'node', [path.join(HERE, 'password-input.mjs')]],
  ['List', 'node', [path.join(HERE, 'list.mjs')]],
  ['EmptyState', 'node', [path.join(HERE, 'empty-state.mjs')]],
  ['Popover', 'node', [path.join(HERE, 'popover.mjs')]],
  ['Drawer', 'node', [path.join(HERE, 'drawer.mjs')]],
  ['Progress', 'node', [path.join(HERE, 'progress.mjs')]],
  ['SearchInput', 'node', [path.join(HERE, 'search-input.mjs')]],
  ['NumberInput', 'node', [path.join(HERE, 'number-input.mjs')]],
  ['Slider', 'node', [path.join(HERE, 'slider.mjs')]],
  ['SegmentedControl', 'node', [path.join(HERE, 'segmented-control.mjs')]],
  ['Combobox', 'node', [path.join(HERE, 'combobox.mjs')]],
  ['Icon names', 'node', [path.join(HERE, 'icon-names.mjs')]],
  ['Stepper', 'node', [path.join(HERE, 'stepper.mjs')]],
  ['Kbd', 'node', [path.join(HERE, 'kbd.mjs')]],
  ['FileUpload', 'node', [path.join(HERE, 'file-upload.mjs')]],
  ['DatePicker', 'node', [path.join(HERE, 'date-picker.mjs')]],
  ['DateRangePicker', 'node', [path.join(HERE, 'date-range-picker.mjs')]],
  ['Image', 'node', [path.join(HERE, 'image.mjs')]],
  ['TimePicker', 'node', [path.join(HERE, 'time-picker.mjs')]],
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
// CI runs the suite as parallel jobs, one per group: node tools/test/run.mjs --group checks|components|visual|storybook.
// A step not named here is a component suite.
const GROUPS = {
  checks: ['Package', 'Component contract', 'Foundation audit', 'Design tokens export', 'Style Dictionary', 'Utility classes', 'Icon names', 'Icon builder', 'Custom icons', 'Page groundwork', 'Usage guides'],
  visual: ['Visual snapshots'],
  storybook: ['Storybook'],
};
const groupOf = (name) => Object.keys(GROUPS).find((g) => GROUPS[g].includes(name)) || 'components';
if (arg('--group')) {
  const g = arg('--group');
  if (![...Object.keys(GROUPS), 'components'].includes(g)) { console.error(`Unknown --group "${g}" (checks, components, visual or storybook)`); process.exit(2); }
  steps.splice(0, steps.length, ...steps.filter(([name]) => groupOf(name) === g));
}
if (arg('--compat')) steps.push([`Cross-browser (${arg('--compat')})`, 'node', [path.join(HERE, 'compat.mjs'), '--engine', arg('--compat'), ...(arg('--driver') ? ['--driver', arg('--driver')] : [])]]);
const summary = [];
for (const [name, cmd, args] of steps) {
  console.log(`\n━━ ${name} ━━`);
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, DIKI_PROJECT: PROJECT } });
  summary.push([name, r.status === 0, Date.now() - t0]);
}
console.log('\n━━ Summary ━━');
for (const [name, ok, ms] of summary) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${(ms / 1000).toFixed(1)}s)`);
process.exit(summary.every(([, ok]) => ok) ? 0 : 1);
