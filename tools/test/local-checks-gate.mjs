// The merge gate for SERUPA_CI_MODE=local (tools/local-checks-gate.mjs) on crafted descriptions: it passes only a
// passing tools/ci.mjs report for the pipeline's commit, made from a clean install with --since and nothing left out
// (the changeset step only with the "no-changeset" label).
//   node tools/test/local-checks-gate.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, report, done } from './lib.mjs';

const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });
const SHA = '0123456789abcdef0123456789abcdef01234567';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-gate-'));
const gate = (text, labels = '', sha = SHA) => {
  const file = path.join(dir, 'description.md');
  fs.writeFileSync(file, text);
  const env = { ...process.env, CI_MERGE_REQUEST_LABELS: labels };
  return spawnSync(process.execPath, [path.join(PROJECT, 'tools', 'local-checks-gate.mjs'), file, sha], { encoding: 'utf8', env });
};
const reportOf = ({ result = 'All passed', commit = SHA.slice(0, 9), command = 'node tools/ci.mjs --clean --since origin/main --report local-checks.md', extra = '' } = {}) =>
  `Some words about the change.\n\n## Local checks\n\n**${result}** on \`${commit}\`\n\nCommand: \`${command}\`\n${extra}`;

const table = [
  ['a passing report for this commit', reportOf(), '', 0],
  ['no report', 'Just a description.', '', 1],
  ['a failed report', reportOf({ result: 'FAILED' }), '', 1],
  ['a report for another commit', reportOf({ commit: 'fedcba987' }), '', 1],
  ['a report made with uncommitted changes', reportOf({ extra: '\nMade with uncommitted changes.\n' }), '', 1],
  ['a report without --clean', reportOf({ command: 'node tools/ci.mjs --since origin/main --report local-checks.md' }), '', 1],
  ['a report without --since (no changeset step, no narrowing)', reportOf({ command: 'node tools/ci.mjs --clean --report local-checks.md' }), '', 1],
  ['a report that left out a step', reportOf({ extra: '\nLeft out: visual.\n' }), '', 1],
  ['a report that left out the changeset step', reportOf({ extra: '\nLeft out: changeset.\n' }), '', 1],
  ['the same, with the no-changeset label', reportOf({ extra: '\nLeft out: changeset.\n' }), 'docs,no-changeset', 0],
  ['the label doesn\'t excuse another step', reportOf({ extra: '\nLeft out: changeset, visual.\n' }), 'no-changeset', 1],
];
try {
  for (const [label, text, labels, want] of table) {
    const r = gate(text, labels);
    t(`${want ? 'fails' : 'passes'}: ${label}`, r.status === want, (r.stdout + r.stderr).trim());
  }
  t('the last "## Local checks" counts, so an old report above a new one is ignored', gate(reportOf({ result: 'FAILED' }) + '\n\n' + reportOf()).status === 0);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
done(report('Local checks gate', R));
