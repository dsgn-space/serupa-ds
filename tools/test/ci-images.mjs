// The images CI runs (.github/workflows/*.yml): each one is pinned by digest as well as by tag, so a tag moved upstream can't
// change what a job runs (GR277), and the Playwright image is the version package-lock.json installs, so its system
// libraries and fonts match the Chromium the tests drive. An image named by a matrix variable (node:${{ matrix.node }}, the
// consumer jobs trying each supported Node) is left out: it tests the Node line as published.
//   node tools/test/ci-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const dir = path.join(PROJECT, '.github', 'workflows');
const ci = fs.readdirSync(dir).filter((f) => f.endsWith('.yml')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const images = [...ci.matchAll(/^\s*image:\s*(\S+)\s*$/gm)].map((m) => m[1]).filter((i) => !i.includes('$'));
t('CI names its images', images.length >= 3, images.join(', '));
const loose = images.filter((i) => !/^[^@\s]+:[^@\s]+@sha256:[0-9a-f]{64}$/.test(i));
t('every image is pinned by tag and digest (name:tag@sha256:…)', !loose.length, `${loose.join(', ')}: add the digest`);
const lock = JSON.parse(fs.readFileSync(path.join(PROJECT, 'package-lock.json'), 'utf8'));
const pw = lock.packages?.['node_modules/playwright']?.version ?? lock.packages?.['node_modules/@playwright/test']?.version;
const image = images.find((i) => i.startsWith('mcr.microsoft.com/playwright:'));
t('the Playwright image is the version package-lock.json installs', pw && image?.startsWith(`mcr.microsoft.com/playwright:v${pw}-`), `image ${image}, package-lock ${pw}`);
done(report('CI images', R));
