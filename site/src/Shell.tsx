// The frame every page sits in: a skip link, the top bar (sections, search, theme), the section's pages beside the
// content, and the footer. All of it is Serupa's own components.
import * as React from 'react';
import { Button } from '../../src/components/Button/Button';
import { CommandPalette, type Command } from '../../src/components/CommandPalette/CommandPalette';
import { Drawer } from '../../src/components/Drawer/Drawer';
import { IconButton } from '../../src/components/IconButton/IconButton';
import { Kbd } from '../../src/components/Kbd/Kbd';
import { Link } from '../../src/components/Link/Link';
import { Navbar, NavbarLink } from '../../src/components/Navbar/Navbar';
import { Sidebar, SidebarItem, SidebarSection } from '../../src/components/Sidebar/Sidebar';
import { SkipLink } from '../../src/components/SkipLink/SkipLink';
import { pages, sectionOf, sections, type NavSection } from './pages';
import { navigate, usePath } from './router';
import { ThemeControls } from './theme';

// Every page, for the search: its section is its group, and a component's summary helps find it by what it does.
const commands: Command[] = [
  ...sections.filter((s) => s.lead).map((s) => ({ id: s.path, label: s.label, group: 'Sections', onSelect: () => navigate(s.path) })),
  ...pages.map((p) => ({ id: p.path, label: p.name, group: p.section, keywords: [p.group, p.summary].filter(Boolean), onSelect: () => navigate(p.path) })),
];

// The site's own pages, after the docs' sections.
const EXTRA: Array<[string, string]> = [['/showcase', 'Showcase'], ['/themes', 'Themes'], ['/about', 'About']];

function SectionNav({ section, path }: { section: NavSection; path: string }) {
  const nav = React.useRef<HTMLElement>(null);
  // A page opened by its address, or from the search, may be far down a long list: bring its entry into view inside the
  // list, without moving the page. An entry already in view stays where it is, so a click in the list moves nothing.
  React.useEffect(() => {
    const at = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    let box = at?.parentElement;
    while (box && !(box.scrollHeight > box.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box === nav.current ? null : box.parentElement;
    if (!at || !box) return;
    const a = at.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (a.top < b.top || a.bottom > b.bottom) box.scrollTop += a.top - b.top - (b.height - a.height) / 2;
  }, [path]);
  return <Sidebar ref={nav} aria-label={section.label} className="site-sidebar">
    {section.groups.map((g) => <SidebarSection key={g.title} title={g.title || undefined}>
      {g.pages.map((p) => <SidebarItem key={p.path} href={p.path} label={p.name} active={p.path === path} />)}
    </SidebarSection>)}
  </Sidebar>;
}

export function Shell({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  const path = usePath();
  const section = sectionOf(path);
  // A section's own index page lists its pages itself; the list beside the content is for the pages inside it.
  const side = section && section.path !== path || section?.id === 'start' ? section : undefined;
  const [search, setSearch] = React.useState(false);
  const [browse, setBrowse] = React.useState(false);
  React.useEffect(() => { setBrowse(false); }, [path]);
  return <div className="site">
    <SkipLink />
    <Navbar sticky size="full" aria-label="Main"
      brand={<a href="/" className="site-brand" aria-label="Serupa, home"><span className="site-brand__mark" aria-hidden="true" />Serupa</a>}
      actions={<>
        <Button className="site-search" variant="outline" size="sm" leftIcon="search" onClick={() => setSearch(true)}>Search <Kbd keys={['mod', 'K']} size="sm" /></Button>
        <IconButton className="site-search-compact" icon="search" label="Search" variant="ghost" onClick={() => setSearch(true)} />
        <ThemeControls />
      </>}>
      {sections.map((s) => <NavbarLink key={s.id} href={s.path} active={section?.id === s.id}>{s.label}</NavbarLink>)}
      {EXTRA.map(([to, label]) => <NavbarLink key={to} href={to} active={path === to}>{label}</NavbarLink>)}
    </Navbar>
    <CommandPalette commands={commands} open={search} onOpenChange={setSearch} placeholder="Search the docs" emptyText="No page matches" />
    <div className="site-body" data-side={side ? '' : undefined} data-aside={aside ? '' : undefined}>
      {side && <div className="site-side">{<SectionNav section={side} path={path} />}</div>}
      <main id="main" tabIndex={-1} className="site-main">
        {side && <div className="site-browse">
          <Button variant="outline" size="sm" leftIcon="menu" onClick={() => setBrowse(true)}>{side.label}</Button>
          <Drawer open={browse} onOpenChange={setBrowse} title={side.label} placement="start">
            <SectionNav section={side} path={path} />
          </Drawer>
        </div>}
        {children}
      </main>
      {aside && <aside className="site-aside" aria-label="On this page">{aside}</aside>}
    </div>
    <footer className="site-footer">
      <p>Serupa {__VERSION__}, designed and built by Diki.</p>
      <p className="flex flex-wrap gap-4">
        <Link href="/about" tone="neutral" underline="hover">The story</Link>
        <Link href="/changelog" tone="neutral" underline="hover">Changelog</Link>
        <Link href="/accessibility-statement" tone="neutral" underline="hover">Accessibility</Link>
        <Link href="/versioning-and-tools" tone="neutral" underline="hover">Versioning</Link>
      </p>
    </footer>
  </div>;
}
