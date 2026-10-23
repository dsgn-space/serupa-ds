// Icon builder: tools/icons/build.mjs turns SVG files into safe, one-color icons on the 24×24 grid.
//   node tools/test/icon-builder.mjs [project dir]
//
// Checks that clean exports (Figma, Illustrator, hand-written, outlined/stroke icons) are accepted and
// drawn in currentColor; that anything unsafe or off-system is refused with a reason; that the build is
// repeatable and --check notices a stale registry; and that the icons now in src/icons.ts and index.d.ts are
// exactly what the builder would write.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { projectArg, report, done } from './lib.mjs';

const P = projectArg();
const BUILD = path.join(P, 'tools', 'icons', 'build.mjs');
const B = await import(BUILD);

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
const svg = (inner, attrs = 'viewBox="0 0 24 24"') => `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;
const accepts = (src, name = 'test-icon') => {
  try { return [B.clean(src, name), null]; } catch (e) { if (e instanceof B.IconError) return [null, e.message]; throw e; }
};
const refuses = (label, src, expect, name = 'test-icon') => {
  const [body, err] = accepts(src, name);
  check(`refuses ${label}`, body === null && (err || '').toLowerCase().includes(expect.toLowerCase()), `got: ${err || body}`);
};

// --- accepted, and normalised to currentColor
const FIGMA = svg('<path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 16.5L5.5 21L7.5 13.5L2 9H9Z" fill="#1E1E1E"/>',
  'width="24" height="24" viewBox="0 0 24 24" fill="none"');
let [body, err] = accepts(FIGMA);
check('accepts a Figma export (svg fill="none", path fill="#1E1E1E") and draws it in currentColor',
  body && body.includes('fill="currentColor"') && !body.includes('#1E1E1E') && !body.includes('width'), err || body);
const STROKE = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  'viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"');
[body, err] = accepts(STROKE);
check('accepts an outlined (stroke) icon: shapes stay unfilled, strokes use currentColor',
  body && body.startsWith('<g ') && body.includes('fill="none"') && body.includes('stroke="currentColor"') && body.includes('stroke-width="2"'), err || body);
const HOLES = svg('<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zm0 5a5 5 0 1 1 0 10a5 5 0 1 1 0-10z"/>');
[body, err] = accepts(HOLES);
check('keeps fill-rule="evenodd" holes', body && body.includes('fill-rule="evenodd"'), err || body);
const ILLUSTRATOR = '<?xml version="1.0" encoding="utf-8"?><!-- Generator: Adobe Illustrator -->'
  + '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">'
  + '<style type="text/css"></style><title>bolt</title><g id="Group"><rect x="4" y="4" width="16" height="16" rx="3" style="fill:#333333"/></g></svg>';
[body, err] = accepts(ILLUSTRATOR);
check('refuses an Illustrator <style> element', body === null && (err || '').includes('<style>'), err || body);
[body, err] = accepts(ILLUSTRATOR.replace('<style type="text/css"></style>', ''));
check('accepts an Illustrator export: drops ids, title, style, xml:space; keeps the rect in currentColor',
  body === '<g><rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"/></g>', err || body);
[body, err] = accepts(svg('<path d="M4 4h16v16H4z" fill="currentColor" opacity=".5"/><path d="M8 8h8v8H8z"/>'));
check('allows one color at two opacities (a duotone in one color)', body && body.includes('opacity=".5"'), err || body);
[body, err] = accepts(svg('<path d="M2 2h20v20H2z"/>', 'viewBox="0,0,24,24"'));
check('accepts a viewBox written with commas', body, err);
[body, err] = accepts(svg('<!-- a note --><path d="M2 2h20v20H2z" fill="&#x23;000"/>'));
check('reads comments and character references', body === '<path d="M2 2h20v20H2z" fill="currentColor"/>', err || body);

// --- refused, with a reason
refuses('<script>', svg('<script>alert(1)</script><path d="M0 0h24v24H0z"/>'), "isn't allowed");
refuses('event handlers (onload)', svg('<path d="M0 0h24v24H0z" onload="alert(1)"/>'), 'event handler');
refuses('event handlers on <svg>', svg('<path d="M0 0h24v24H0z"/>', 'viewBox="0 0 24 24" onclick="x()"'), 'event handler');
refuses('<use href>', svg('<use href="#a"/>'), "isn't allowed");
refuses('xlink:href', svg('<path d="M0 0h24v24H0z" xlink:href="https://x.test/a.svg"/>', 'xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"'), 'links to something');
refuses('<image>', svg('<image href="data:image/png;base64,AAAA" width="24" height="24"/>'), "isn't allowed");
refuses('<foreignObject>', svg('<foreignObject width="24" height="24"><div>x</div></foreignObject>'), "isn't allowed");
refuses('<text>', svg('<text x="0" y="12">A</text>'), "isn't allowed");
refuses('gradients (url(...) fill)', svg('<defs><linearGradient id="g"/></defs><path d="M0 0h24v24H0z" fill="url(#g)"/>'), 'defs');
refuses('a gradient fill without defs', svg('<path d="M0 0h24v24H0z" fill="url(#g)"/>'), 'gradient');
refuses('masks', svg('<path d="M0 0h24v24H0z" mask="url(#m)"/>'), 'mask');
refuses('javascript: in a value', svg('<path d="M0 0h24v24H0z" transform="javascript:alert(1)"/>'), 'links to something');
refuses('a DOCTYPE / entity (XML bombs)', '<!DOCTYPE svg [<!ENTITY a "aaaa">]>' + svg('<path d="M0 0h24v24H0z"/>'), 'DOCTYPE');
refuses('another grid (viewBox 0 0 32 32)', svg('<path d="M0 0h32v32H0z"/>', 'viewBox="0 0 32 32"'), '24×24');
refuses('a missing viewBox', svg('<path d="M0 0h24v24H0z"/>', 'width="24" height="24"'), 'missing');
refuses('two colors (white shapes instead of holes)', svg('<circle cx="12" cy="12" r="10" fill="#000"/><circle cx="12" cy="12" r="4" fill="#fff"/>'), '2 colors');
refuses('a color in style="" plus a fill', svg('<path d="M0 0h9v9H0z" style="fill:#f00"/><path d="M9 9h9v9H9z" fill="#00f"/>'), '2 colors');
refuses('bad path data', svg('<path d="M0 0 &quot;x"/>'), "isn't a value");
refuses('non-numeric geometry', svg('<circle cx="calc(1)" cy="12" r="4"/>'), 'number');
refuses('an empty icon', svg('<g></g>'), 'no shapes');
refuses('file names with spaces or capitals', svg('<path d="M0 0h24v24H0z"/>'), 'lowercase', 'My Icon');
refuses('not SVG at all', 'hello', 'not valid SVG');
refuses('unclosed tags', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z">', 'not valid SVG');
refuses('mismatched tags', svg('<g><path d="M0 0h24v24H0z"/></path>'), 'not valid SVG');
refuses('an unbound prefix', svg('<path d="M0 0h24v24H0z" foo:bar="1"/>'), 'not valid SVG');

// --- the build: writes src/icons.ts (the registry and CustomIconName), repeatable, --check, and the shipped registry
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-icons-'));
try {
  const proj = path.join(tmp, 'p');
  fs.mkdirSync(path.join(proj, 'src'), { recursive: true });
  const ICONS_TS = path.join(proj, 'src', 'icons.ts');
  fs.copyFileSync(path.join(P, 'src', 'icons.ts'), ICONS_TS);
  const icons = path.join(tmp, 'icons');
  fs.mkdirSync(icons);
  fs.writeFileSync(path.join(icons, 'serupa-star.svg'), FIGMA);
  fs.writeFileSync(path.join(icons, 'serupa-clock.svg'), STROKE);
  fs.writeFileSync(path.join(icons, 'notes.txt'), 'ignored');
  const run = (...a) => spawnSync(process.execPath, [BUILD, '--project', proj, ...a], { encoding: 'utf8' });
  const r = run(icons);
  const js = fs.readFileSync(ICONS_TS, 'utf8');
  const reg = B.readRegistry(js);
  check('build writes the icons into src/icons.ts, sorted by name', r.status === 0 && JSON.stringify(Object.keys(reg)) === '["serupa-clock","serupa-star"]', r.stdout + r.stderr);
  check('build writes CustomIconName into src/icons.ts', js.includes('export type CustomIconName = "serupa-clock" | "serupa-star";'), (/CustomIconName = [^;]*;/.exec(js) || [''])[0]);
  check('src/icons.ts holds no literal </script and no outside URL', !js.toLowerCase().includes('</script') && !JSON.stringify(reg).includes('http'));
  const r2 = run(icons);
  check('building again changes nothing', fs.readFileSync(ICONS_TS, 'utf8') === js && r2.status === 0);
  check('--check passes when in step', run('--check', icons).status === 0);
  fs.writeFileSync(path.join(icons, 'serupa-new.svg'), HOLES);
  check('--check fails after an icon is added', run('--check', icons).status === 1);
  fs.writeFileSync(path.join(icons, 'bad.svg'), svg('<script>x</script>'));
  const r3 = run(icons);
  check('a bad file stops the build and leaves src/icons.ts untouched', r3.status === 1 && r3.stderr.includes('bad:') && fs.readFileSync(ICONS_TS, 'utf8') === js, r3.stderr);
  fs.rmSync(path.join(icons, 'bad.svg'));
  const r4 = run(path.join(tmp, 'nowhere'));
  const after = fs.readFileSync(ICONS_TS, 'utf8');
  check('a missing folder removes every custom icon', r4.status === 0 && !Object.keys(B.readRegistry(after)).length && after.includes('CustomIconName = never;'), r4.stdout + r4.stderr);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// the icons shipped now: each one is exactly what the builder makes of it, and the types list the same names
const ts = fs.readFileSync(path.join(P, 'src', 'icons.ts'), 'utf8');
const reg = B.readRegistry(ts);
const unsafe = [];
for (const [n, b] of Object.entries(reg)) {
  try { if (B.clean(svg(b), n) !== b) unsafe.push(n); } catch (e) { unsafe.push(`${n} (${e.message})`); }
}
check(`shipped custom icons (${Object.keys(reg).length}) are clean builder output`, !unsafe.length, unsafe.join(', '));
check('CustomIconName lists the same custom icon names as the registry', ts.includes(B.tsBlock(reg)));
check('the registry is what the builder writes for it', ts.includes(B.jsBlock(reg)));
const built = path.join(P, 'dist', 'index.d.ts');
if (fs.existsSync(built)) {
  const names = Object.keys(reg).sort().map((n) => JSON.stringify(n)).join(' | ') || 'never';
  check('the built types (dist/index.d.ts) carry the same CustomIconName', (/type CustomIconName = ([^;]*);/.exec(fs.readFileSync(built, 'utf8')) || [])[1] === names);
}
const src = path.join(P, 'assets', 'Icons');
if (fs.existsSync(src)) {
  const r = spawnSync(process.execPath, [BUILD, '--project', P, '--check', src], { encoding: 'utf8' });
  check('assets/Icons and the components are in step', r.status === 0, r.stdout + r.stderr);
}

done(report('Icon builder', results));
