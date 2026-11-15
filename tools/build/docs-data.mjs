// The docs a project's coding agents look things up in, from the installed release (bin/serupa-docs.mjs): every
// component's guide (its README.md: when to use it, props, keyboard, tokens), the skill's topics (install, theme,
// rules, accessibility) and every token's description, in dist/docs.json. And dist/llms.txt, the short summary an
// agent reads first, which points it at `npx serupa-docs` rather than the repository. Both come with the release a
// project pinned, so nothing an agent looks up is newer or older than the code it runs. The build writes them.
import fs from 'node:fs';
import path from 'node:path';
import { components, componentIndex, status } from './registry.mjs';
import { tokenDescriptions } from '../tokens/build.mjs';

/** A guide's links to other guides (../Combobox/README.md) as the command that prints that guide. */
const unlink = (text) => text.replace(/\]\(\.\.\/(\w+)\/README\.md(#[\w-]+)?\)/g, '] (npx serupa-docs $1)');

/** The skill's own sections (## headings) before its component list, as topics: install, theme, rules, ... */
export function skillTopics(skill) {
  const body = skill.replace(/^---[\s\S]*?---\s*/, '');
  return [...body.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)]
    .filter((m) => m[1] !== 'Components')
    .map((m) => ({ name: m[1].trim(), text: `## ${m[1].trim()}\n${m[2]}`.trimEnd() + '\n' }));
}

/**
 * Everything serupa-docs answers from.
 * @param {string} root the repository
 * @param {string} version the release
 */
export function docsData(root, version) {
  const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');
  const list = components(root).map((name) => {
    const guide = read('src', 'components', name, 'README.md');
    const stories = path.join(root, 'src', 'components', name, `${name}.stories.tsx`);
    const group = (fs.existsSync(stories) && /title: '(?:Components\/)?([^'/]+)\//.exec(fs.readFileSync(stories, 'utf8'))?.[1]) || 'Other';
    const intro = (/^# .*\n+([^\n#`|<-][^\n]*)/m.exec(guide) || [])[1] ?? '';
    const summary = ((/^.*?[.!?](?=\s|$)/.exec(intro) || [intro])[0]).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    const also = ((/^\*\*Also called:\*\* (.+?)\.?\s*$/m.exec(guide) || [])[1] ?? '').split(/,\s*/).filter(Boolean);
    return { name, group, status: status(name, root), summary, also, guide: unlink(guide) };
  });
  const tokens = [...tokenDescriptions(JSON.parse(read('tokens.json')))].map(([name, description]) => ({ name, description }));
  return { version, components: list, topics: skillTopics(read('skills', 'serupa', 'SKILL.md')), tokens };
}

/** dist/llms.txt: what Serupa is, how to look things up, and the components, for an agent to read first. */
export function llmsTxt(root, version) {
  return `# Serupa design system (@diki-stwn/serupa-ds ${version})

> A React 19 component library with design tokens, six themes and utility classes, accessible to WCAG 2.2 AA in every theme. Use its components and tokens instead of writing your own.

This file comes with the installed release, and so does everything below: every component, prop and token it names exists in the version this project uses.

## Look things up

Ask the command line, not the web: it answers from this release.

- \`npx serupa-docs\`: every component, by group, with what it's for
- \`npx serupa-docs <Component>\`: its whole guide (when to use it, when not to, props, keyboard, accessibility, tokens)
- \`npx serupa-docs <Component> <section>\`: one part of it, such as \`npx serupa-docs Button props\`
- \`npx serupa-docs search <words>\`: components, topics and tokens that match
- \`npx serupa-docs topics\`, then \`npx serupa-docs <topic>\`: install, theme, rules, accessibility, before you finish
- \`--json\` on any of them for data

For a whole screen, start from a ready-made one: \`npx serupa-add\` lists the patterns and blocks, and \`npx serupa-add <Name>\` writes one into \`src/serupa/\` as source to change.

## Instructions

Before UI work, read \`node_modules/@diki-stwn/serupa-ds/skills/serupa/SKILL.md\` and follow it. To review a UI change, follow \`node_modules/@diki-stwn/serupa-ds/skills/serupa-review/SKILL.md\`.

## Components

${componentIndex(root, { plain: true })}`;
}
