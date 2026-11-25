// Tests mutation.mjs's restart after a mutant hangs: the file is scored the same with a hang as without one, but for
// the mutant that hung, which counts as killed. A new Vitest once kept the old one's test specifications, so every
// mutant after a hang counted as killed and dates.ts scored 100% instead of 84.3% (25 Nov).
//   node tools/test/mutation-restart.mjs                       src/internal/useFormReset.ts, its first mutant hanging
//   node tools/test/mutation-restart.mjs src/internal/x.ts 3   another file, its third mutant hanging
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PROJECT } from './lib.mjs';

const [file = 'src/internal/useFormReset.ts', at = '1'] = process.argv.slice(2);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mutation-restart-'));
const run = (name, extra) => {
  const out = path.join(dir, `${name}.json`);
  // A drop below the baseline exits 1 and is not this test's business, so the exit code is ignored.
  try { execFileSync(process.execPath, ['tools/test/mutation.mjs', file, '--json', out, ...extra], { cwd: PROJECT, stdio: 'inherit' }); } catch {}
  const r = JSON.parse(fs.readFileSync(out, 'utf8'))[file];
  if (!r) throw new Error(`${file} went unscored in the ${name} run`);
  return r;
};
const plain = run('plain', []), hung = run('hung', ['--hang', at]);
fs.rmSync(dir, { recursive: true, force: true });

const problems = [];
if (hung.mutants !== plain.mutants) problems.push(`${hung.mutants} mutants with the hang, ${plain.mutants} without`);
if (hung.killed + hung.survived.length !== hung.mutants) problems.push(`killed ${hung.killed} and survived ${hung.survived.length} don't add up to ${hung.mutants}`);
const lost = plain.survived.filter((s) => !hung.survived.includes(s)), gained = hung.survived.filter((s) => !plain.survived.includes(s));
// Only the mutant that hung may move from survived to killed.
if (lost.length > 1) problems.push(`${lost.length} survivors counted as killed after the hang: ${lost.join(', ')}`);
if (gained.length) problems.push(`survived only with the hang: ${gained.join(', ')}`);
if (plain.survived.length < 2) problems.push(`${file} has ${plain.survived.length} survivors without a hang; pick a file with two or more, or this tests nothing`);
if (problems.length) {
  console.error(`FAIL  ${file}, mutant ${at} hanging:\n${problems.map((p) => `      ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`PASS  ${file}: ${plain.killed}/${plain.mutants} killed without a hang, ${hung.killed}/${hung.mutants} with mutant ${at} hanging, the same survivors after it`);
