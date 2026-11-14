// What the site's own pages (the front page, the story) say about Serupa in numbers and names, read from the
// sources so none of it is typed in: the design principles from their page, the decisions from docs/adr/, and the
// counts of stories and tokens.
//   node tools/site/facts.mjs   prints them as JSON
import fs from 'node:fs';
import path from 'node:path';

const walk = (dir, keep, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(dir, e.name), keep, out);
    else if (keep(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
};

/** @returns {{ principles: Array<{ name: string, line: string }>, decisions: Array<{ id: string, title: string }>, stories: number, tokens: number }} */
export function siteFacts(root) {
  const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');
  // Each principle is a "## Name" and the sentence under it.
  const principles = [...read('docs', 'foundations', 'DesignPrinciples.mdx').matchAll(/^## (.+)\n+([^\n<#-][^\n]*)/gm)].map((m) => ({ name: m[1].trim(), line: m[2].trim() }));
  const decisions = fs.readdirSync(path.join(root, 'docs', 'adr')).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort().map((f) => {
    const title = /^# (?:ADR-\d+:\s*)?(.+)$/m.exec(read('docs', 'adr', f))?.[1]?.trim() ?? f;
    return { id: f.slice(0, 4), title };
  });
  const stories = walk(path.join(root, 'src'), (n) => n.endsWith('.stories.tsx')).reduce((n, f) => n + (fs.readFileSync(f, 'utf8').match(/^export const \w+: Story\b/gm)?.length ?? 0), 0);
  const tokens = new Set(read('tokens.css').match(/^\s*--[a-z0-9-]+(?=:)/gm)?.map((t) => t.trim())).size;
  return { principles, decisions, stories, tokens };
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  console.log(JSON.stringify(siteFacts(path.resolve(import.meta.dirname, '..', '..')), null, 2));
}
