// A section's index (Components, Foundations, Patterns…): its pages as cards, grouped as the sidebar groups them,
// with a filter where there are many.
import * as React from 'react';
import { Badge } from '../../src/components/Badge/Badge';
import { Card, CardHeader } from '../../src/components/Card/Card';
import { EmptyState } from '../../src/components/EmptyState/EmptyState';
import { Heading } from '../../src/components/Heading/Heading';
import { SearchInput } from '../../src/components/SearchInput/SearchInput';
import { pagesOf, type NavSection, type Page } from './pages';
import { Shell } from './Shell';

const STATUS = { alpha: 'warning', beta: 'info', deprecated: 'danger' } as const;

export function PageCard({ page, headingLevel = 3 }: { page: Page; headingLevel?: 2 | 3 }) {
  return <Card as="li" href={page.path} className="site-card">
    <CardHeader headingLevel={headingLevel} title={page.name} description={page.summary || undefined}
      action={page.status !== 'stable' ? <Badge tone={STATUS[page.status]}>{page.status[0]!.toUpperCase() + page.status.slice(1)}</Badge> : undefined} />
  </Card>;
}

export function Index({ section }: { section: NavSection }) {
  const [query, setQuery] = React.useState('');
  React.useEffect(() => { document.title = `${section.label} · Serupa`; window.scrollTo(0, 0); }, [section]);
  const total = pagesOf(section).length;
  const q = query.trim().toLowerCase();
  const groups = section.groups.map((g) => ({ ...g, pages: g.pages.filter((p) => !q || `${p.name} ${p.summary} ${p.group}`.toLowerCase().includes(q)) })).filter((g) => g.pages.length);
  const found = groups.reduce((n, g) => n + g.pages.length, 0);
  return <Shell>
    <div className="site-index">
      <header className="site-title">
        <p className="site-eyebrow">Serupa</p>
        <Heading level={1} className="site-h1">{section.label}</Heading>
        <p className="site-lead">{section.lead}</p>
      </header>
      {total > 12 && <div className="site-index__filter">
        <SearchInput aria-label={`Filter ${section.label.toLowerCase()}`} placeholder={`Filter ${total} ${section.label.toLowerCase()}`} value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
        <p className="sr-only" role="status">{q ? `${found} of ${total} shown` : ''}</p>
      </div>}
      {groups.map((g) => <section key={g.title} aria-label={g.title || section.label} className="site-index__group">
        {g.title && <Heading level={2} className="site-h site-h2">{g.title}</Heading>}
        <ul className="site-grid" role="list">{g.pages.map((p) => <PageCard key={p.path} page={p} headingLevel={g.title ? 3 : 2} />)}</ul>
      </section>)}
      {!groups.length && <EmptyState announce icon="search_off" title={`Nothing matches “${query}”`} description="Try a shorter word, or what the component does." />}
    </div>
  </Shell>;
}
