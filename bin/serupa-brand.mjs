#!/usr/bin/env node
// Make a light and a dark theme from one brand color (I5).
//
// usage:  npx serupa-brand <name> <color> [-o <file.css>]
//
//   npx serupa-brand acme "#0f766e" -o src/acme-theme.css
//
// Load the file after tokens.css and set data-theme="acme-light" or "acme-dark" (or data-brand="acme" with
// data-mode, and list the brand in data-brands for theme.js). The shades, the contrast each alias needs and the
// reasons a color can't work are in bin/brand/generate.mjs; without -o the CSS goes to the standard output and the
// shades it picked to the standard error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { brandTheme } from './brand/generate.mjs';

export { brandTheme, ramp, contrast } from './brand/generate.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const USAGE = 'usage: serupa-brand <name> <color> [-o <file.css>]';
const stop = (message) => { console.error(`serupa-brand: ${message}\n${USAGE}`); process.exit(2); };

export function main(argv) {
  const rest = [];
  let out = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') { out = argv[++i]; if (!out || out.startsWith('-')) stop(`${a} needs a file name`); }
    // A theme is its colors (17.0.0): corners and motion are set apart from the brand, for every brand at once.
    else if (a === '--corners') stop('--corners was removed in 19.0.0: corners are their own setting, data-radius="sharp" or "round" on <html>');
    else if (a === '--motion') stop('--motion was removed in 19.0.0: set the --motion-* tokens in your own CSS (docs/foundations.md, Motion)');
    else if (a === '-h' || a === '--help') { console.log(USAGE); return 0; }
    else if (a.startsWith('-') && !/^-?#?[0-9a-f]{3,6}$/i.test(a)) stop(`unknown option ${a}`);
    else rest.push(a);
  }
  if (rest.length !== 2) stop(rest.length < 2 ? 'give a name and a color, such as: serupa-brand acme "#0f766e"' : `too many arguments: ${rest.slice(2).join(' ')}`);
  const tokens = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'tokens.json'), 'utf8'));
  let r;
  try { r = brandTheme({ name: rest[0], color: rest[1], tokens }); } catch (e) { stop(e.message); }
  const [name] = rest;
  const said = ['light', 'dark'].map((m) => `${name}-${m}: primary ${r.picks[m].fill ? `${r.picks[m].fill} (${name}-${r.picks[m].fillFrom}${r.picks[m].fill === r.shades[r.picks[m].fillFrom] ? '' : ', a little lighter'}), text ${name}-${r.picks[m].primary}` : `${name}-${r.picks[m].primary}`}, hover ${r.picks[m].hover}, focus ring ${r.picks[m].focus}; more contrast ${r.picks[m].more}`);
  if (out) {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    fs.writeFileSync(out, r.css);
    console.log(`wrote ${out}\n${said.join('\n')}`);
  } else {
    process.stdout.write(r.css);
    console.error(said.join('\n'));
  }
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
