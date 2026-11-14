// Storybook's doc blocks, as the site draws them. The .mdx pages and the docs' own blocks (docs/blocks.tsx) import
// these names from '@storybook/addon-docs/blocks'; the site's Vite config points that import here, so one page
// source serves both. Add a name here when a page starts using another of Storybook's blocks
// (tools/test/site.mjs fails until it's here).
import * as React from 'react';
import { Badge } from '../../src/components/Badge/Badge';
import { Button } from '../../src/components/Button/Button';
import { CodeBlock } from '../../src/components/CodeBlock/CodeBlock';
import { Heading } from '../../src/components/Heading/Heading';
import { Loader } from '../../src/components/Loader/Loader';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../src/components/Table/Table';
import { Tab, TabList, TabPanel, Tabs } from '../../src/components/Tabs/Tabs';
import { Markdown } from './markdown';
import type { ComponentDoc, Page } from './pages';
import { StoryView, entryOf, parameter, sourceOf, type StoryEntry } from './stories';

export { Markdown };

export interface Docs {
  /** The stories of the page's stories file, as Storybook's context lists them. */
  componentStories: () => StoryEntry[];
  page: Page | null;
  /** The page's component and the ones it exports beside it, with their props. */
  docs: ComponentDoc[];
}
export const DocsContext = React.createContext<Docs>({ componentStories: () => [], page: null, docs: [] });
const useDocs = () => React.useContext(DocsContext);

/** In Storybook this names the page and ties it to its stories; the site reads both from the file before it loads. */
export function Meta(_props: { title?: string; of?: unknown; name?: string }) { return null; }

const STATUS = {
  alpha: { tone: 'warning', label: 'Alpha', title: 'Still taking shape: it may change in any release' },
  beta: { tone: 'info', label: 'Beta', title: 'Its API may still change in a minor release' },
  deprecated: { tone: 'danger', label: 'Deprecated', title: 'Going in the next major release' },
} as const;

/** The page's title, with where it sits and, for a component that isn't stable, its status. */
export function Title({ children }: { children?: React.ReactNode }) {
  const { page } = useDocs();
  const status = page && page.status !== 'stable' ? STATUS[page.status] : null;
  return <header className="site-title">
    {page && <p className="site-eyebrow">{[page.section, page.group].filter(Boolean).join(' · ')}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <Heading level={1} className="site-h1">{children ?? page?.name}</Heading>
      {status && <Badge tone={status.tone} title={status.title}>{status.label}</Badge>}
    </div>
  </header>;
}

/** What the component is, from its stories' description or the doc comment on its export. */
export function Description() {
  const { componentStories, docs, page } = useDocs();
  const meta = componentStories()[0]?.meta;
  const own = (meta?.parameters?.docs as { description?: { component?: string } } | undefined)?.description?.component;
  const text = own ?? docs.find((d) => d.name === page?.component)?.description;
  return text ? <div className="site-lead"><Markdown plain>{text}</Markdown></div> : null;
}

// Nothing opens over the page until someone asks. A story that opens a dialog, a menu or a tooltip as it arrives (an
// open palette, a dialog shown on arrival) would cover the page it documents, and a page with eight of them opens
// eight. The browser's own calls that put an element on top of the page are held back for a story nobody has touched
// yet: the stage hears of it and shows a button in the story's place, which runs the story for real.
const ARMED = 'data-site-armed';
const HELD = 'site:held';
function holdBack<K extends 'showModal' | 'showPopover' | 'togglePopover'>(proto: Record<K, (...args: never[]) => unknown> | undefined, method: K) {
  const real = proto?.[method];
  if (!proto || typeof real !== 'function') return;
  proto[method] = function held(this: HTMLElement, ...args: never[]) {
    const stage = this.closest('[data-site-demo]');
    // A tooltip is the exception: it is a line of text beside its button, takes no focus and covers nothing to use.
    if (!stage || stage.hasAttribute(ARMED) || this.getAttribute('role') === 'tooltip') return real.apply(this, args);
    // The story's effects run before its stage's, so the stage may not be listening yet: leave it a note as well.
    stage.setAttribute('data-site-held', '');
    stage.dispatchEvent(new CustomEvent(HELD));
    return undefined;
  };
}
if (typeof window !== 'undefined') {
  holdBack(window.HTMLDialogElement?.prototype as never, 'showModal');
  holdBack(window.HTMLElement?.prototype as never, 'showPopover');
  holdBack(window.HTMLElement?.prototype as never, 'togglePopover');
}

/** A story's stage. It starts inert and wakes a moment later: a story that takes focus as it mounts (an error
 *  summary, a field with autoFocus) would otherwise pull the page down to it before anyone has read a line. A story
 *  that opens something over the page waits behind a button (see holdBack above). */
function Stage({ entry, className }: { entry: StoryEntry; className?: string }) {
  const [awake, setAwake] = React.useState(false);
  // 'live': drawn, and held back until someone points at it or tabs into it. 'held': it tried to open something on
  // arrival, so the button stands in for it. 'run': someone pressed the button.
  const [mode, setMode] = React.useState<'live' | 'held' | 'run'>('live');
  const stage = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { const t = setTimeout(() => setAwake(true), 400); return () => clearTimeout(t); }, []);
  React.useEffect(() => {
    const el = stage.current;
    if (!el || mode !== 'live') return;
    const hold = () => { el.removeAttribute('data-site-held'); setMode('held'); };
    if (el.hasAttribute('data-site-held')) hold();
    el.addEventListener(HELD, hold);
    return () => el.removeEventListener(HELD, hold);
  }, [mode]);
  // A tooltip follows its button to the edge of the window and waits there once the button has scrolled away: a page
  // of them would pile up at the edge. While most of a stage is out of view, its tooltips are hidden (site.css).
  React.useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const seen = new IntersectionObserver(([e]) => {
      if (e) el.toggleAttribute('data-site-away', e.intersectionRatio < 0.75 && e.intersectionRect.height < (e.rootBounds?.height ?? 0) * 0.75);
    }, { rootMargin: '-72px 0px 0px 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);
  const arm = () => stage.current?.setAttribute(ARMED, '');
  // A whole screen scrolls inside its frame, so the frame is a stop for the keyboard to scroll it from.
  const scrolls = parameter(entry, 'layout') === 'fullscreen' && !!className;
  return <div ref={stage} className={className} data-site-demo="" inert={!awake} {...(mode === 'run' ? { [ARMED]: '' } : {})} onPointerEnter={arm} onFocus={arm}
    {...(scrolls && mode !== 'held' ? { tabIndex: 0, role: 'group', 'aria-label': `${entry.name}, example` } : {})}>
    {mode === 'held'
      ? <div className="site-held">
        <p>This example opens over the page.</p>
        <Button variant="outline" leftIcon="play_arrow" onClick={() => setMode('run')}>Open the example<span className="sr-only">: {entry.name}</span></Button>
      </div>
      : <StoryView key={mode} entry={entry} />}
  </div>;
}

/** One story in its frame: the live example, and its code on request. */
function Demo({ entry }: { entry: StoryEntry }) {
  const [code, setCode] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const toggle = () => {
    setOpen((o) => !o);
    if (code == null) void sourceOf(entry).then(setCode, () => setCode(''));
  };
  return <div className="site-demo" data-layout={String(parameter(entry, 'layout') ?? 'padded')}>
    <Stage entry={entry} className="site-demo__stage" />
    <div className="site-demo__bar">
      <Button variant="ghost" size="sm" leftIcon="code" aria-expanded={open} aria-controls={id} onClick={toggle}>{open ? 'Hide code' : 'Show code'}</Button>
    </div>
    <div id={id} className="site-demo__code" hidden={!open}>
      {open && (code == null ? <Loader size="sm" label="Loading the code" /> : <CodeBlock language="tsx" title={`${entry.exportName} in ${entry.file.split('/').pop()}`} code={code} />)}
    </div>
  </div>;
}

/** A story in its frame: <Canvas of={Stories.Default} />. */
export function Canvas({ of }: { of?: unknown }) {
  const entry = entryOf(of);
  return entry ? <Demo entry={entry} /> : null;
}

/** A story on its own, without a frame: the docs' diagrams draw over it. */
export function Story({ of }: { of?: unknown }) {
  const entry = entryOf(of);
  return entry ? <Stage entry={entry} /> : null;
}

/** The first story: the component as it usually looks. */
export function Primary() {
  const first = useDocs().componentStories()[0];
  return first ? <Demo entry={first} /> : null;
}

/** Every story of the page, each under its name. */
export function Stories({ title, includePrimary = true }: { title?: string; includePrimary?: boolean }) {
  const all = useDocs().componentStories();
  const list = includePrimary ? all : all.slice(1);
  return <>
    {title ? <Heading level={2} className="site-h site-h2">{title}</Heading> : null}
    {list.map((entry) => <section key={entry.id} className="site-story" aria-labelledby={entry.slug}>
      <Heading level={3} id={entry.slug} className="site-h site-h3">{entry.name}</Heading>
      {entry.description && <Markdown plain>{entry.description}</Markdown>}
      <Demo entry={entry} />
    </section>)}
  </>;
}

// A long table starts with its first rows; the rest are a press away, so the guide under it isn't a screen further down.
const FIRST = 8;
function PropsTable({ doc }: { doc: ComponentDoc }) {
  const [all, setAll] = React.useState(doc.props.length <= FIRST + 2);
  const defaults = doc.props.some((p) => p.default != null);
  const rows = all ? doc.props : doc.props.slice(0, FIRST);
  return <>
    <Table size="sm" caption={`${doc.name} props`} hideCaption containerProps={{ className: 'site-table site-table--props' }}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Prop</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          {defaults && <TableHeaderCell>Default</TableHeaderCell>}
          <TableHeaderCell>What it does</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((p) => <TableRow key={p.name}>
          <TableCell><code className="site-code site-code--name">{p.name}</code>{p.required && <span className="site-required"> required</span>}</TableCell>
          <TableCell><code className="site-code">{p.type}</code></TableCell>
          {defaults && <TableCell>{p.default != null ? <code className="site-code">{p.default}</code> : null}</TableCell>}
          <TableCell>
            {p.deprecated != null && <Badge tone="danger" className="me-2">Deprecated</Badge>}
            {p.deprecated || p.description ? <Markdown plain>{[p.deprecated, p.description].filter(Boolean).join(' ')}</Markdown> : null}
          </TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
    {!all && <div className="site-more"><Button variant="outline" size="sm" rightIcon="expand_more" onClick={() => setAll(true)}>Show all {doc.props.length} props</Button></div>}
  </>;
}

/** The props, read from the TypeScript types: the component's own, and those of the parts it exports beside it. */
export function Controls() {
  const { docs } = useDocs();
  if (!docs.length) return null;
  return <section aria-labelledby="api">
    <Heading level={2} id="api" className="site-h site-h2">API</Heading>
    <p className="site-p">Read from the component’s TypeScript types, so it is always what this version takes.</p>
    {docs.length === 1 ? <PropsTable doc={docs[0]!} /> : <Tabs defaultValue={docs[0]!.name} size="sm">
      <TabList aria-label="Components">{docs.map((d) => <Tab key={d.name} value={d.name}>{d.name}</Tab>)}</TabList>
      {docs.map((d) => <TabPanel key={d.name} value={d.name}><PropsTable doc={d} /></TabPanel>)}
    </Tabs>}
  </section>;
}

/** A snippet of code in a page: <Source language="tsx" code="…" />. */
export function Source({ code = '', language }: { code?: string; language?: string; dark?: boolean }) {
  return <CodeBlock className="site-pre" language={language} code={code} />;
}
