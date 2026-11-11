#!/usr/bin/env node
// Point a project's coding agents at the Serupa skill that came with its install (PN4). AGENTS.md is read by Codex,
// Cursor, Copilot and others, and Claude Code reads it through a CLAUDE.md line, "@AGENTS.md". The section names
// node_modules/serupa-ds/skills/serupa/SKILL.md, which always matches the release the project pinned, so an agent
// never uses a component or prop newer than the one installed (`npx skills add` takes the skill from main).
//
// usage:  npx serupa-agents [folder]
//
// Adds the section to the folder's AGENTS.md (made if missing), between its own markers. Makes a CLAUDE.md with
// "@AGENTS.md" when the folder has none, or adds that line to one that doesn't import AGENTS.md yet. Running it again
// changes nothing; a newer release's wording replaces the old one between the markers. serupa-create writes the same
// files into a new app.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const START = '<!-- serupa-ds:start -->';
const END = '<!-- serupa-ds:end -->';

/** The AGENTS.md section, markers included. */
export const SECTION = `${START}
## UI: the Serupa design system

This project's UI is built with Serupa (\`serupa-ds\`). Before any UI work, read \`node_modules/serupa-ds/skills/serupa/SKILL.md\`
and follow it. It comes with the installed release, so every component, prop and token it names exists here. Before
you call a UI change done, run the project's check (\`npm run check\` in an app \`serupa-create\` made) and fix what it
finds. To review a UI change, follow \`node_modules/serupa-ds/skills/serupa-review/SKILL.md\`.
${END}
`;

/**
 * An AGENTS.md with the section in it: added at the end, or put in place of an older one between the markers.
 * @param {string} text the file as it is ('' when there is none)
 * @param {string} [title] the heading for a new file
 */
export function withSection(text, title = 'Agents') {
  const at = text.indexOf(START), end = text.indexOf(END);
  if (at >= 0 && end > at) return text.slice(0, at) + SECTION.trimEnd() + text.slice(end + END.length);
  if (!text.trim()) return `# ${title}\n\n${SECTION}`;
  return text.replace(/\s*$/, '\n\n') + SECTION;
}

/** CLAUDE.md for a project that has none: Claude Code reads the AGENTS.md it imports. */
export const CLAUDE = '@AGENTS.md\n';

function main(argv) {
  const USAGE = 'usage: serupa-agents [folder]';
  if (argv.includes('-h') || argv.includes('--help')) { console.log(USAGE); return 0; }
  const [dir = '.', extra] = argv;
  if (dir.startsWith('-')) { console.error(`serupa-agents: unknown option ${dir}\n${USAGE}`); return 2; }
  if (extra !== undefined) { console.error(`serupa-agents: one folder only, not ${extra}\n${USAGE}`); return 2; }
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { console.error(`${dir} isn't a folder.`); return 1; }
  const agents = path.join(dir, 'AGENTS.md'), claude = path.join(dir, 'CLAUDE.md');
  const before = fs.existsSync(agents) ? fs.readFileSync(agents, 'utf8') : '';
  const after = withSection(before);
  const said = [];
  if (after !== before) { fs.writeFileSync(agents, after); said.push(before ? 'added the Serupa section to AGENTS.md' : 'made AGENTS.md'); }
  if (!fs.existsSync(claude)) { fs.writeFileSync(claude, CLAUDE); said.push('made CLAUDE.md (@AGENTS.md)'); }
  else {
    const text = fs.readFileSync(claude, 'utf8');
    if (!/^@AGENTS\.md\s*$/m.test(text)) { fs.writeFileSync(claude, text.replace(/\s*$/, '\n\n') + CLAUDE); said.push('added @AGENTS.md to CLAUDE.md'); }
  }
  console.log(said.length ? `serupa-agents: ${said.join(', ')}.` : 'serupa-agents: AGENTS.md already points at the Serupa skill; nothing changed.');
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
