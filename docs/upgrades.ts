// The upgrade guide (40): every breaking change, major by major, from CHANGELOG.md and from the major changesets
// not released yet, so the guide is written once, in the entry, and can't miss one. serupa-migrate's changes
// (bin/migrate/transforms.mjs) are listed with the major that made them.

export type Major = { version: string; date: string; next: boolean; entries: string[] };

// An entry is a top-level "- " bullet with the indented lines under it.
const bullets = (text: string) => text.split(/\n(?=- )/).filter((b) => b.startsWith('- ')).map((b) => b.replace(/\s+$/, ''));
// Breaking: marked so, or with a migration note, or under a "Changed (breaking)" or "Removed" heading of a major.
const breaking = (entry: string, heading: string) => /^- \*\*Breaking/.test(entry) || /\*\*Migration[.:*]|Migration:/.test(entry) || /\(breaking\)|^Removed/i.test(heading);

/** The majors in a changelog, newest first, each with its breaking entries. */
export function majorsIn(changelog: string): Major[] {
  const out: Major[] = [];
  let current: Major | null = null;
  for (const section of changelog.split(/\n(?=## )/)) {
    const v = /^## \[?(\d+)\.(\d+)\.(\d+)\]?(?: - (\S+))?/.exec(section);
    if (!v) continue;
    current = v[2] === '0' && v[3] === '0' ? { version: `${v[1]}.0.0`, date: v[4] || '', next: false, entries: [] } : null;
    if (!current) continue;
    out.push(current);
    for (const part of section.split(/\n(?=### )/)) {
      const heading = /^### (.+)/.exec(part)?.[1] || '';
      for (const b of bullets(part)) if (breaking(b, heading)) current.entries.push(b);
    }
  }
  return out;
}

/** The next major, from the changesets that ask for one: their breaking entries, or the whole note when it has none
 * marked. Null when no changeset asks for a major. */
export function nextMajor(current: string, changesets: Record<string, string>): Major | null {
  const entries: string[] = [];
  for (const text of Object.values(changesets)) {
    const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text.replace(/\r\n/g, '\n'));
    if (!m || !/^\s*['"]?serupa-ds['"]?\s*:\s*major\s*$/m.test(m[1])) continue;
    const body = m[2].trim();
    const list = bullets(body);
    const marked = list.filter((b) => breaking(b, ''));
    entries.push(...(marked.length ? marked : list.length ? list : ['- ' + body]));
  }
  if (!entries.length) return null;
  return { version: `${Number(current.split('.')[0]) + 1}.0.0`, date: '', next: true, entries };
}

/** The next major for the upgrade guide: the one the major changesets ask for, or, when none does yet, an empty one
 * while serupa-migrate already has changes for it (props deprecated now and removed then), so the page lists them
 * before the release. Null when neither. */
export function upcomingMajor(current: string, changesets: Record<string, string>, transformVersions: string[]): Major | null {
  const next = nextMajor(current, changesets);
  if (next) return next;
  const version = `${Number(current.split('.')[0]) + 1}.0.0`;
  return transformVersions.includes(version) ? { version, date: '', next: true, entries: [] } : null;
}
