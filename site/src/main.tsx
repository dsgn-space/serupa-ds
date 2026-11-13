// The docs site's entry (npm run site): the system's own styles, then the page for the address.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '../../tokens.css';
import '../../src/styles/base.css';
import '../../src/styles/index.css';
import '../../.storybook/docs.css';
import './site.css';
import { configure } from '../../src/internal/config';
import { Button } from '../../src/components/Button/Button';
import { EmptyState } from '../../src/components/EmptyState/EmptyState';
import { Heading } from '../../src/components/Heading/Heading';
import { ErrorBoundary } from '../../src/components/ErrorBoundary/ErrorBoundary';
import { Doc } from './Doc';
import { Home } from './Home';
import { Index } from './Index';
import { pageAt, sections } from './pages';
import { RouterLink, usePath } from './router';
import { Shell } from './Shell';

// Every Serupa component with an href (Navbar, Sidebar, Card, Button, Link) goes through the site's router.
configure({ link: RouterLink });

function NotFound() {
  React.useEffect(() => { document.title = 'Page not found · Serupa'; }, []);
  return <Shell>
    <Heading level={1} className="sr-only">Page not found</Heading>
    <EmptyState icon="explore_off" title="There’s no page here" description="The address may be old, or mistyped." headingLevel={2}
      actions={<><Button href="/">Go to the front page</Button><Button href="/components" variant="outline">Browse the components</Button></>} />
  </Shell>;
}

function App() {
  const path = usePath();
  const page = pageAt(path);
  const section = sections.find((s) => s.lead && s.path === path);
  return <ErrorBoundary resetKeys={[path]}>
    {path === '/' ? <Home /> : page ? <Doc page={page} /> : section ? <Index section={section} /> : <NotFound />}
  </ErrorBoundary>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
