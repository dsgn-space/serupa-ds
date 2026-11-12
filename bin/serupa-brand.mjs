#!/usr/bin/env node
// Make a light and a dark theme from one brand color (I5).
//
// usage:  npx serupa-brand <name> <color> [--look plain|modern] [--corners default|sharp|round] [-o <file.css>]
//
//   npx serupa-brand acme "#0f766e" -o src/acme-theme.css
//   npx serupa-brand acme "#0f766e" --look modern -o src/acme-theme.css   (Modern's calm neutrals, corners and motion)
//
// Load the file after tokens.css and set data-theme="acme-light" or "acme-dark" (or data-brand="acme" with
// data-mode, and list the brand in data-brands for theme.js). The shades, the contrast each alias needs and the
// reasons a color can't work are in bin/brand/generate.mjs; without -o the CSS goes to the standard output and the
// shades it picked to the standard error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { brandTheme, CORNER_PRESETS, LOOKS } from './brand/generate.mjs';

export { brandTheme, ramp, contrast } from './brand/generate.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const USAGE = `usage: serupa-brand <name> <color> [--look ${LOOKS.join('|')}] [--corners ${CORNER_PRESETS.join('|')}] [-o <file.css>]`;
const stop = (message) => { console.error(`serupa-brand: ${message}\n${USAGE}`); process.exit(2); };

export function main(argv) {
  const rest = [];
  let out = null, corners = 'default', look = 'plain';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') { out = argv[++i]; if (!out || out.startsWith('-')) stop(`${a} needs a file name`); }
    else if (a === '--look') { look = argv[++i]; if (!look || look.startsWith('-')) stop(`--look takes ${LOOKS.join(', ')}`); }
    else if (a === '--corners') { corners = argv[++i]; if (!corners || corners.startsWith('-')) stop(`--corners takes ${CORNER_PRESETS.join(', ')}`); }
    else if (a === '-h' || a === '--help') { console.log(USAGE); return 0; }
    else if (a.startsWith('-') && !/^-?#?[0-9a-f]{3,6}$/i.test(a)) stop(`unknown option ${a}`);
    else rest.push(a);
  }
  if (rest.length !== 2) stop(rest.length < 2 ? 'give a name and a color, such as: serupa-brand acme "#0f766e"' : `too many arguments: ${rest.slice(2).join(' ')}`);
  const tokens = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'tokens.json'), 'utf8'));
  let r;
  try { r = brandTheme({ name: rest[0], color: rest[1], corners, look, tokens }); } catch (e) { stop(e.message); }
  const [name] = rest;
  const said = ['light', 'dark'].map((m) => `${name}-${m}: primary ${name}-${r.picks[m].primary}, hover ${r.picks[m].hover}, focus ring ${r.picks[m].focus}; more contrast ${r.picks[m].more}`);
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
