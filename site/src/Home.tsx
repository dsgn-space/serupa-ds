// The site's front page: what Serupa is, shown with Serupa. The hero's cards are live components, the brand switch
// re-themes the whole page, the six tiles are the same markup under each theme's tokens, and the screen is a
// pattern's story. The numbers and the principles are read from the sources (tools/site/facts.mjs).
import * as React from 'react';
import facts from 'virtual:site-facts';
import tokens from '../../tokens.json';
import { Badge } from '../../src/components/Badge/Badge';
import { Button } from '../../src/components/Button/Button';
import { Card, CardHeader } from '../../src/components/Card/Card';
import { Heading } from '../../src/components/Heading/Heading';
import { Progress } from '../../src/components/Progress/Progress';
import { SegmentedControl } from '../../src/components/SegmentedControl/SegmentedControl';
import { Switch } from '../../src/components/Switch/Switch';
import { pages, pagesOf, sections } from './pages';
import { InviteCard, ProjectCard, StatusCard } from './Sample';
import { DEVICES, Screen } from './Screen';
import { Shell } from './Shell';
import { BRANDS, brandName, useTheme } from './theme';

export const PRINCIPLES = facts.principles.filter((p) => p.name !== 'Influences');
const number = (n: number) => n.toLocaleString('en');
const STATS: Array<[string, string]> = [
  [number(pages.filter((p) => p.component).length), 'components'],
  [number(facts.stories), 'live examples'],
  [number(facts.tokens), 'design tokens'],
  [number(tokens.color.themes.length), 'themes'],
];

function Section({ id, eyebrow, title, lead, action, children }: { id: string; eyebrow: string; title: string; lead: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section aria-labelledby={id} className="site-band">
    <div className="site-band__head">
      <div>
        <p className="site-eyebrow">{eyebrow}</p>
        <Heading level={2} id={id} className="site-band__title">{title}</Heading>
        <p className="site-band__lead">{lead}</p>
      </div>
      {action}
    </div>
    {children}
  </section>;
}

/** One theme in small: the same four parts under that theme's tokens. It is a picture of the theme, not controls. */
function ThemeTile({ id, name }: { id: string; name: string }) {
  const [brand, mode] = id.split('-');
  return <li className="site-tile">
    <div className="site-tile__view" data-brand={brand} data-mode={mode} inert aria-hidden="true">
      <div className="flex items-center justify-between gap-2"><Badge tone="success" dot>Active</Badge><Switch defaultChecked aria-label="Sample" /></div>
      <Progress value={68} aria-label="Sample" size="sm" />
      <div className="flex gap-2"><Button size="sm">Save</Button><Button size="sm" variant="secondary">Cancel</Button></div>
    </div>
    <p className="site-tile__name">{name}</p>
  </li>;
}

export function Home() {
  const { brand, set } = useTheme();
  // On a phone the screen is a phone's, life-size, rather than a laptop's made small.
  const [device] = React.useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? DEVICES[0] : DEVICES[2]));
  React.useEffect(() => { document.title = 'Serupa design system'; window.scrollTo(0, 0); }, []);
  return <Shell>
    <div className="site-home">
      <header className="site-hero">
        <div className="site-hero__text">
          <p className="site-eyebrow">Serupa design system · version {__VERSION__}</p>
          <Heading level={1} className="site-hero__title">One system for every project.</Heading>
          <p className="site-hero__lead">Design tokens, six themes and {pages.filter((p) => p.component).length} accessible React components, each with a guide. Designed and built by Diki, and everything on this site is made with it.</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/getting-started" size="lg" rightIcon="arrow_forward">Get started</Button>
            <Button href="/showcase" size="lg" variant="outline">See it in use</Button>
          </div>
        </div>
        <div className="site-hero__art">
          <div className="site-hero__switch">
            <p id="hero-brand" className="site-hero__hint">These are live components. Change the brand:</p>
            <SegmentedControl aria-labelledby="hero-brand" size="sm" value={brand} onValueChange={(b: string) => set({ brand: b })} options={BRANDS.map((b) => ({ value: b, label: brandName(b) }))} />
          </div>
          <div className="site-hero__cards">
            <div className="site-hero__col"><ProjectCard headingLevel={2} /><StatusCard /></div>
            <div className="site-hero__col"><InviteCard headingLevel={2} /></div>
          </div>
        </div>
      </header>

      <dl className="site-stats">
        {STATS.map(([n, label]) => <div key={label} className="site-stats__item"><dt>{label}</dt><dd>{n}</dd></div>)}
      </dl>

      <Section id="home-themes" eyebrow="Theming" title="Six themes, one attribute" lead="Three brands, each light and dark. A theme changes the tokens and nothing else, so every component follows without a line of its own."
        action={<Button href="/themes" variant="outline" rightIcon="arrow_forward">Compare the themes</Button>}>
        <ul className="site-tiles" role="list">{tokens.color.themes.map((t) => <ThemeTile key={t.id} id={t.id} name={t.name} />)}</ul>
      </Section>

      <Section id="home-principles" eyebrow="Principles" title="What every decision is held to" lead="When two of them pull apart, accessibility comes first."
        action={<Button href="/about" variant="outline" rightIcon="arrow_forward">Read the story</Button>}>
        <ol className="site-principles" role="list">
          {PRINCIPLES.map((p, i) => <li key={p.name} className="site-principle">
            <span className="site-principle__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <Heading level={3} className="site-principle__name">{p.name}</Heading>
            <p className="site-principle__line">{p.line}</p>
          </li>)}
        </ol>
      </Section>

      <Section id="home-showcase" eyebrow="Showcase" title="Whole screens, from the same parts" lead="A dashboard, a checkout, a sign-in: each pattern is a real screen with its loading, empty and error states, at any width."
        action={<Button href="/showcase" variant="outline" rightIcon="arrow_forward">Open the showcase</Button>}>
        <Screen story="patterns-dashboard--default" device={device} title="Dashboard, an example screen" address="northwind.example/dashboard" />
      </Section>

      <Section id="home-explore" eyebrow="Documentation" title="Explore the system" lead="Every page is drawn from the same sources as the components, so the docs can’t drift from what ships.">
        <ul className="site-grid" role="list">
          {sections.filter((s) => s.lead).map((s) => <Card key={s.id} as="li" href={s.path} className="site-card">
            <CardHeader headingLevel={3} title={s.label} description={s.lead}>
              <p className="site-card__count">{pagesOf(s).length} pages</p>
            </CardHeader>
          </Card>)}
        </ul>
      </Section>
    </div>
  </Shell>;
}
