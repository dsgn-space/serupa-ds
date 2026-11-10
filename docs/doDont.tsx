// Do and don't (GR326): a usage rule shown as two live examples side by side, one to follow and one to avoid, as
// design systems' guides do, so a reader who skims sees the rule. The pairs come from the README's
// "### Do and don't" section, a list of bullets, each naming the story that shows it, a Do then its Don't:
//   ### Do and don't
//
//   - **Do:** One primary button for the main action. (`DoOnePrimary`)
//   - **Don't:** Several primary buttons side by side. (`DontManyPrimaries`)
// On GitLab the list reads as two rules; on the Storybook page each pair is drawn with its stories.
// tools/test/guides.mjs checks that the bullets pair up and that every story they name exists.
import * as React from 'react';
import { DocsContext, Markdown, Story } from '@storybook/addon-docs/blocks';

export type DoDontItem = { kind: 'do' | 'dont'; text: string; story: string };
export type DoDontPair = { do: DoDontItem; dont: DoDontItem };

const ITEM = /^- \*\*(Do|Don't):\*\* (.+?) \(`(\w+)`\)\s*$/;

/** The pairs in a "### Do and don't" section's bullets: each Do followed by its Don't. */
export function parseDoDont(section: string): DoDontPair[] {
  const items = section.split('\n').map((l) => ITEM.exec(l)).filter((m): m is RegExpExecArray => !!m)
    .map((m): DoDontItem => ({ kind: m[1] === 'Do' ? 'do' : 'dont', text: m[2], story: m[3] }));
  const pairs: DoDontPair[] = [];
  for (let i = 0; i + 1 < items.length; i += 2) if (items[i].kind === 'do' && items[i + 1].kind === 'dont') pairs.push({ do: items[i], dont: items[i + 1] });
  return pairs;
}

/** The guide with its "### Do and don't" bullets swapped for the pairs, drawn. */
export function doDontAt(md: string): (string | DoDontPair[])[] {
  const at = md.search(/^### Do and don't\s*$/m);
  if (at < 0) return [md];
  const rest = md.slice(at), body = rest.indexOf('\n') + 1;   // the section runs to the next heading after its own
  const end = rest.slice(body).search(/^##+ /m);
  const section = end < 0 ? rest : rest.slice(0, body + end);
  const pairs = parseDoDont(section);
  if (!pairs.length) return [md];
  const list = section.search(/^- \*\*Do/m);
  return [md.slice(0, at + list), pairs, md.slice(at + section.length)];
}

// export name → the story id's last part, as Storybook makes it (DoOnePrimary → do-one-primary)
const idPart = (exportName: string) => exportName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

function Example({ item }: { item: DoDontItem }) {
  const stories = React.useContext(DocsContext).componentStories();
  const story = stories.find((s) => s.id.endsWith('--' + idPart(item.story)));
  const ok = item.kind === 'do';
  // The verdict is in words (✓ Do, ✗ Don't) and in the bar's color, so it doesn't rest on color alone.
  return <figure className={'sb-dodont__item sb-dodont__item--' + item.kind}>
    <div className="sb-dodont__stage">{story ? <Story of={story.moduleExport} /> : null}</div>
    <figcaption className="sb-dodont__caption">
      <strong className="sb-dodont__verdict">{ok ? '✓ Do' : '✗ Don’t'}</strong>
      <Markdown>{item.text}</Markdown>
    </figcaption>
  </figure>;
}

/** Each pair side by side (stacked on a narrow page): the Do, then the Don't. */
export function DoDont({ pairs }: { pairs: DoDontPair[] }) {
  return <div className="sb-dodont sb-unstyled">
    {pairs.map((p, i) => <div className="sb-dodont__pair" key={i}><Example item={p.do} /><Example item={p.dont} /></div>)}
  </div>;
}
