// A component's own changelog (134): the entries of CHANGELOG.md that are about it, for the end of its docs page.

export type Change = { version: string; date: string; kind: string; text: string };

// Names that are also everyday words ("Text at 200%", "a List of…"): an entry is about one of these only when it
// names the component as such: `<Text>`, "Text:", "Text's", "(Text)" or in a list of names ("Tabs, Text and…").
const COMMON = new Set(['Container', 'Divider', 'Field', 'Grid', 'Heading', 'Highlight', 'Icon', 'Image', 'Kbd', 'Link', 'List', 'Menu', 'Progress', 'Prose', 'Rating', 'Stack', 'Text', 'Timeline', 'Toolbar']);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every changelog entry that names the component, newest first: one bullet each, with its version and section. */
export function changesFor(name: string, changelog: string): Change[] {
  const loose = new RegExp(`(?<![\\w-])${esc(name)}(?![\\w-])`);
  // A common word counts as the component when it's code, a label, possessive, in brackets or in a list of names.
  const strict = new RegExp(`<${esc(name)}\\b|\`${esc(name)}\`|(?<![\\w-])${esc(name)}(?=:|['’]s\\b|\\)|, [A-Z]| and [A-Z]| or [A-Z])|(?:\\(|, |and |or )${esc(name)}(?![\\w-])`);
  const about = COMMON.has(name) ? strict : loose;
  const out: Change[] = [];
  let version = '', date = '', kind = '';
  for (const block of changelog.split(/\n(?=## |### |- )/)) {
    const v = /^## \[([^\]]+)\](?: - (\S+))?/.exec(block);
    if (v) { version = v[1]; date = v[2] || ''; kind = ''; continue; }
    const k = /^### (\w+)/.exec(block);
    if (k) { kind = k[1]; continue; }
    if (!block.startsWith('- ') || !version || version === 'Unreleased') continue;
    const text = block.slice(2).trim();
    if (about.test(text)) out.push({ version, date, kind, text });
  }
  return out;
}
