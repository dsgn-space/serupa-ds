// The showcase: every pattern as a screen, at a phone's, a tablet's or a laptop's width, in each of its states
// (its stories: loading, empty, failed). The screens are the patterns' own stories, so a pattern added to
// src/patterns/ shows up here.
import * as React from 'react';
import { Button } from '../../src/components/Button/Button';
import { Field } from '../../src/components/Field/Field';
import { Heading } from '../../src/components/Heading/Heading';
import { SegmentedControl } from '../../src/components/SegmentedControl/SegmentedControl';
import { Select } from '../../src/components/Select/Select';
import { pages } from './pages';
import { DEVICES, Screen } from './Screen';
import { Shell } from './Shell';
import { loadStories, type StoryEntry } from './stories';

const SCREENS = pages.filter((p) => p.section === 'Patterns' && p.stories).sort((a, b) => a.name.localeCompare(b.name, 'en'));
const FIRST = SCREENS.find((p) => p.name === 'Dashboard') ?? SCREENS[0];

export function Showcase() {
  const [path, setPath] = React.useState(FIRST?.path ?? '');
  const [states, setStates] = React.useState<StoryEntry[]>([]);
  const [slug, setSlug] = React.useState('');
  // A wide page starts with the laptop's width; a phone starts with the phone's, where the screen is life-size.
  const [device, setDevice] = React.useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'phone' : 'desktop'));
  const page = SCREENS.find((p) => p.path === path) ?? FIRST;
  React.useEffect(() => { document.title = 'Showcase · Serupa'; window.scrollTo(0, 0); }, []);
  React.useEffect(() => {
    let live = true;
    setStates([]); setSlug('');
    if (page?.stories) void loadStories(page.stories).then((all) => { if (live) { setStates(all); setSlug(all[0]?.slug ?? ''); } }, () => {});
    return () => { live = false; };
  }, [page]);
  if (!page) return <Shell><Heading level={1} className="site-h1">Showcase</Heading></Shell>;
  const at = SCREENS.indexOf(page);
  const step = (by: number) => setPath(SCREENS[(at + by + SCREENS.length) % SCREENS.length]!.path);
  const state = states.find((s) => s.slug === slug);
  return <Shell>
    <div className="site-index">
      <header className="site-title">
        <p className="site-eyebrow">Showcase</p>
        <Heading level={1} className="site-h1">Whole screens, built from the system</Heading>
        <p className="site-lead">{SCREENS.length} patterns, each a working screen made only of Serupa’s components. Pick one, choose a state, and change the width to see it reflow.</p>
      </header>
      <div className="site-showcase__bar">
        <Field label="Screen"><Select value={page.path} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPath(e.target.value)} options={SCREENS.map((p) => ({ value: p.path, label: p.name }))} /></Field>
        <Field label="State"><Select value={slug} disabled={states.length < 2} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSlug(e.target.value)} options={states.length ? states.map((s) => ({ value: s.slug, label: s.name })) : [{ value: '', label: 'Loading' }]} /></Field>
        <Field label="Width"><SegmentedControl value={device} onValueChange={setDevice} options={DEVICES.map((d) => ({ value: d.value, label: d.label }))} /></Field>
      </div>
      <section aria-labelledby="showcase-screen" className="site-showcase__stage">
        <div className="site-showcase__about">
          <div>
            <Heading level={2} id="showcase-screen" className="site-showcase__name">{page.name}{state && states.length > 1 ? <span className="site-showcase__state">, {state.name.toLowerCase()}</span> : null}</Heading>
            <p className="site-showcase__summary">{state?.description || page.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" leftIcon="arrow_back" onClick={() => step(-1)}>Previous</Button>
            <Button variant="outline" size="sm" rightIcon="arrow_forward" onClick={() => step(1)}>Next</Button>
            <Button variant="ghost" size="sm" href={page.path}>Read its guide</Button>
          </div>
        </div>
        {slug && <Screen key={`${page.id}--${slug}`} story={`${page.id}--${slug}`} device={DEVICES.find((d) => d.value === device)} title={`${page.name}${state ? `, ${state.name}` : ''}: an example screen`}
          address={`northwind.example/${page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />}
      </section>
    </div>
  </Shell>;
}
