// node install-deps.mjs <browser> <deb folder>: installs the system packages Playwright needs for <browser>,
// keeping the downloaded .deb files in <deb folder> so a later run (with the folder restored from the cache)
// installs them without downloading. Falls back to `playwright install-deps` if the package list can't be read.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const [browser, debs] = process.argv.slice(2);
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });

// --dry-run prints the command it would run: `sudo -- sh -c "apt-get update && apt-get install -y … pkg pkg"`.
const plan = execFileSync('npx', ['playwright', 'install-deps', '--dry-run', browser], { encoding: 'utf8' });
const match = plan.match(/apt-get install -y((?:\s+[a-z0-9][a-z0-9.+:-]*)+)/);
if (!match) {
  if (/already installed|All system dependencies/i.test(plan)) process.exit(0);
  console.log(`Couldn't read the package list, so installing the usual way. Playwright printed:\n${plan}`);
  run('npx', ['playwright', 'install-deps', browser]);
  process.exit(0);
}
const packages = match[1].trim().split(/\s+/).filter((p) => !p.startsWith('-'));

fs.mkdirSync(`${debs}/partial`, { recursive: true });
const cached = fs.readdirSync(debs).filter((f) => f.endsWith('.deb')).length;
console.log(`${packages.length} packages, ${cached} .deb files in the cache`);
// The lists are read fresh, so a package updated since the cache was saved downloads its new version.
run('sudo', ['apt-get', 'update', '-qq']);
run('sudo', ['apt-get', 'install', '-y', '--no-install-recommends', '-o', `Dir::Cache::Archives=${debs}`, '-o', 'APT::Keep-Downloaded-Packages=true', ...packages]);
// apt writes as root; the cache step saves the folder as the runner user.
run('sudo', ['chown', '-R', `${process.getuid()}:${process.getgid()}`, debs]);
