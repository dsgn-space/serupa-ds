import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar, NavbarLink, NavbarMenu, NavbarMenuLink } from '../../components/Navbar/Navbar';
import { Sidebar, SidebarItem, SidebarSection } from '../../components/Sidebar/Sidebar';
import { BottomNav, BottomNavLink } from '../../components/BottomNav/BottomNav';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { Heading } from '../../components/Heading/Heading';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { useName } from '../../../.storybook/content';

/* Patterns are whole screens built from the components, for apps to copy (FEC1). Unlike a component's stories they
   are pages, so tools/test/storybook.mjs also runs the page rules on them: one main landmark, everything inside a
   landmark, two landmarks of a kind told apart by their names, an h1 and no skipped heading level, no id twice.
   It also checks that the first Tab stop is a skip link, and that following it puts focus in main, below the sticky
   Navbar. */
const meta = {
  title: 'Patterns/Page shell',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const rows = ['Website redesign', 'Mobile app', 'Billing migration', 'Design tokens v2', 'Onboarding emails', 'Status page', 'Help centre', 'Pricing page', 'Search', 'Invoices', 'Team settings', 'Audit log'];

/* The page shell: a skip link first, a sticky Navbar (the banner), a Sidebar beside main, and a footer. The Navbar
   and the Sidebar are both navigation landmarks, so the Sidebar gets its own name ("Workspace"), told apart from the
   Navbar's "Main navigation". main takes the SkipLink's focus, and the Navbar's scroll-padding keeps
   it below the bar. The signed-in person follows Storybook's Content menu (.storybook/content.ts). */
const Me = () => <Avatar name={useName('Ada Lovelace')} size="sm" />;
/* Whether the window is at least this wide now, following it as it resizes. */
function useWide(query: string) {
  const subscribe = React.useCallback((done: () => void) => { const m = window.matchMedia(query); m.addEventListener('change', done); return () => m.removeEventListener('change', done); }, [query]);
  return React.useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true);
}

function Shell({ collapsed = false, adaptive = false }: { collapsed?: boolean; adaptive?: boolean }) {
  // Adaptive: the full Sidebar from 1024px, its icon rail from 768px, and a BottomNav below that.
  const wide = useWide('(min-width: 1024px)');
  const rail = adaptive ? !wide : collapsed;
  const phone = adaptive ? '48rem' : '40rem';
  return (
    <div className="min-h-screen bg-surface text-text">
      {/* The Sidebar stays beside main and below the bar while the page scrolls, and gives its room to main on a phone,
          where the Navbar's menu has the same links under "Workspace". */}
      <style>{`.page-shell__side { position: sticky; top: var(--srp-navbar-offset, 0px); height: calc(100vh - var(--srp-navbar-offset, 0px)); } @media (max-width: ${phone}) { .page-shell__side { display: none; } } @media (min-width: calc(${phone} + 0.01rem)) { .page-shell__phone { display: none; } }`}</style>
      <SkipLink />
      <Navbar sticky
        brand={<a href="#home" className="text-base font-semibold text-text no-underline">Acme</a>}
        actions={<><Button variant="ghost" size="sm">Docs</Button><Me /></>}>
        <NavbarLink href="#dashboard" current>Dashboard</NavbarLink>
        <NavbarLink href="#projects">Projects</NavbarLink>
        <NavbarLink href="#reports">Reports</NavbarLink>
        {/* The Sidebar's links, for a phone, where the Sidebar is gone (the adaptive shell has a BottomNav instead). */}
        {adaptive ? null : <NavbarMenu label="Workspace" className="page-shell__phone">
          <NavbarMenuLink href="#home" current>Home</NavbarMenuLink>
          <NavbarMenuLink href="#workspace-projects">Projects</NavbarMenuLink>
          <NavbarMenuLink href="#team">Team</NavbarMenuLink>
        </NavbarMenu>}
      </Navbar>
      <div className="flex">
        <div className="page-shell__side">
          <Sidebar aria-label="Workspace" collapsed={rail}>
            <SidebarSection>
              <SidebarItem href="#home" icon="home" label="Home" current />
              <SidebarItem href="#workspace-projects" icon="folder" label="Projects" />
              <SidebarItem href="#team" icon="group" label="Team" />
            </SidebarSection>
          </Sidebar>
        </div>
        <main id="main" className="min-w-0 flex-1 p-6 outline-none">
          <Heading level={1}>Projects</Heading>
          <p className="mt-2 text-sm text-text-muted">Twelve active projects in the Acme workspace.</p>
          <section aria-labelledby="recent" className="mt-6">
            <Heading level={2} id="recent">Recent</Heading>
            <ul className="mt-3 flex list-none flex-col gap-3 p-0">
              {rows.map((r) => <li key={r} className="rounded-md border border-border p-4">{r}</li>)}
            </ul>
          </section>
        </main>
      </div>
      <footer className="border-t border-border p-6 text-sm text-text-muted">© 2026 Acme</footer>
      {adaptive ? (
        <BottomNav label="Workspace">
          <BottomNavLink href="#home" icon="home" current>Home</BottomNavLink>
          <BottomNavLink href="#workspace-projects" icon="folder">Projects</BottomNavLink>
          <BottomNavLink href="#team" icon="group">Team</BottomNavLink>
        </BottomNav>
      ) : null}
    </div>
  );
}

export const Default: Story = { render: () => <Shell /> };

/** The Sidebar collapsed to an icon rail, for more room in main: each item keeps its name, read out and shown as a
    tooltip, so the rail is as usable as the full Sidebar. */
export const CollapsedSidebar: Story = { render: () => <Shell collapsed /> };

/** The navigation follows the window: a BottomNav on a phone (below 768px), the Sidebar's icon rail on a tablet or a
    narrow window (768 to 1023px), and the full Sidebar from 1024px. The same three places at every width, in the same
    order. Resize the window to see it switch. */
export const AdaptiveNavigation: Story = { render: () => <Shell adaptive /> };
