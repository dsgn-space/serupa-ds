// The native and email kits as files of their own on each GitHub release (tools/publish.mjs), for an iOS, Android or
// email project that doesn't install the npm package:
//   serupa-native-<version>.tar.gz   dist/native/ (Swift, Kotlin, Android resources) and ios/SerupaColors.xcassets, the
//                                    alias colors as an Xcode asset catalog with each brand's light and dark value
//                                    (tools/build/native-tokens.mjs; the package leaves the catalog out: some 1,700 files)
//   serupa-email-<version>.tar.gz    dist/email/: each brand's email CSS and starting email, and tokens.json
// Run after npm run build. Writes them into .release-kits/ and returns their paths.
//   node tools/release-kits.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { assetCatalog } from './build/native-tokens.mjs';

/** Writes the two archives for `version` from the build in `root`/dist, and returns their paths. */
export function releaseKits(root, version) {
  const out = path.join(root, '.release-kits');
  fs.rmSync(out, { recursive: true, force: true });
  const kit = (name, from, more = {}) => {
    const dir = path.join(out, `${name}-${version}`);
    if (!fs.existsSync(from)) throw new Error(`${path.relative(root, from)} is missing: run npm run build first`);
    fs.cpSync(from, dir, { recursive: true });
    for (const [f, body] of Object.entries(more)) {
      fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
      fs.writeFileSync(path.join(dir, f), body);
    }
    const file = path.join(out, `${name}-${version}.tar.gz`);
    execFileSync('tar', ['-czf', file, '-C', out, `${name}-${version}`]);
    return file;
  };
  const catalog = Object.fromEntries(Object.entries(assetCatalog(path.join(root, 'design-tokens'))).map(([f, b]) => [`ios/${f}`, b]));
  return [kit('serupa-native', path.join(root, 'dist', 'native'), catalog), kit('serupa-email', path.join(root, 'dist', 'email'))];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = path.resolve(import.meta.dirname, '..');
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  for (const f of releaseKits(root, version)) console.log(path.relative(root, f));
}
