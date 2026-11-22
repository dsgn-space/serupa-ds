// "Added in" and "changed in" on a component's page (AX6), from docs/since.json, which tools/since.mjs keeps: a
// reader on an older release can tell whether a prop exists for them.

export type Since = { added: string | null; changed: string | null; props: Record<string, string> };

/** The sentence for a component: the release it arrived in, the last that changed its API, and the props that
 * arrived since 10.0.0, newest first, a few releases' worth. Empty when nothing is known. */
export function sinceText(entry: Since | undefined, releases = 3): string {
  if (!entry) return '';
  const parts: string[] = [];
  parts.push(`Added in ${entry.added ?? '10.0.0 or earlier'}.`);
  if (entry.changed && entry.changed !== entry.added) parts.push(`API last changed in ${entry.changed}.`);
  const by = new Map<string, string[]>();
  for (const [prop, v] of Object.entries(entry.props)) by.set(v, [...(by.get(v) || []), prop]);
  const order = (v: string) => v.split('.').map(Number).reduce((n, x) => n * 1000 + x, 0);
  const newest = [...by.keys()].sort((a, b) => order(b) - order(a)).slice(0, releases);
  if (newest.length) parts.push(`New in ${newest.map((v) => `${v}: ${by.get(v)!.sort().map((p) => `\`${p}\``).join(', ')}`).join('; ')}.`);
  return parts.join(' ');
}
