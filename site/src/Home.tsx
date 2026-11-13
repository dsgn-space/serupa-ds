// The site's front page: what Serupa is, how much of it there is, and where to go next.
import * as React from 'react';
import tokens from '../../tokens.json';
import { Button } from '../../src/components/Button/Button';
import { Card, CardHeader } from '../../src/components/Card/Card';
import { Heading } from '../../src/components/Heading/Heading';
import { pages, pagesOf, sections } from './pages';
import { Shell } from './Shell';

const count = (section: string) => pages.filter((p) => p.section === section && p.name !== 'Introduction').length;
const STATS: Array<[number, string]> = [
  [pages.filter((p) => p.component).length, 'components'],
  [count('Patterns'), 'patterns'],
  [count('Blocks'), 'blocks'],
  [tokens.color.themes.length, 'themes'],
];

export function Home() {
  React.useEffect(() => { document.title = 'Serupa design system'; window.scrollTo(0, 0); }, []);
  return <Shell>
    <div className="site-home">
      <header className="site-hero">
        <p className="site-eyebrow">Design system · version {__VERSION__}</p>
        <Heading level={1} className="site-hero__title">Serupa</Heading>
        <p className="site-hero__lead">One system for every project: design tokens, six themes and accessible React components, with a guide for each. Everything on this site is built with it.</p>
        <div className="flex flex-wrap gap-3">
          <Button href="/getting-started" size="lg" rightIcon="arrow_forward">Get started</Button>
          <Button href="/components" size="lg" variant="outline">Browse the components</Button>
        </div>
        <dl className="site-stats">
          {STATS.map(([n, label]) => <div key={label} className="site-stats__item"><dt>{label}</dt><dd>{n}</dd></div>)}
        </dl>
      </header>
      <section aria-labelledby="explore" className="site-home__section">
        <Heading level={2} id="explore" className="site-h site-h2">Explore</Heading>
        <ul className="site-grid" role="list">
          {sections.filter((s) => s.lead).map((s) => <Card key={s.id} as="li" href={s.path} className="site-card">
            <CardHeader headingLevel={3} title={s.label} description={s.lead}>
              <p className="site-card__count">{pagesOf(s).length} pages</p>
            </CardHeader>
          </Card>)}
        </ul>
      </section>
    </div>
  </Shell>;
}
