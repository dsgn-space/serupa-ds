import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from './AppShell';
import { Navbar, NavbarLink } from '../Navbar/Navbar';
import { Sidebar, SidebarItem, SidebarSection } from '../Sidebar/Sidebar';
import { BottomNav, BottomNavLink } from '../BottomNav/BottomNav';
import { Card } from '../Card/Card';
import { Grid } from '../Grid/Grid';
import { Heading } from '../Heading/Heading';
import { Stack } from '../Stack/Stack';

/* Each story's main gets its own id, since the guide's page shows several shells at once. */
const header = <Navbar brand={<span className="text-base font-semibold">Acme</span>} aria-label="Main navigation">
  <NavbarLink href="#dashboard" current>Dashboard</NavbarLink>
  <NavbarLink href="#docs">Docs</NavbarLink>
</Navbar>;
const sidebar = (collapsed = false) => <Sidebar aria-label="Workspace" collapsed={collapsed}>
  <SidebarSection>
    <SidebarItem href="#home" icon="home" label="Home" current />
    <SidebarItem href="#projects" icon="folder" label="Projects" />
    <SidebarItem href="#team" icon="group" label="Team" />
  </SidebarSection>
</Sidebar>;
const content = <Stack gap={4}>
  <Heading level={1}>Projects</Heading>
  <p className="m-0 text-text-muted">Twelve active projects in the Acme workspace.</p>
</Stack>;

const meta = {
  title: 'Components/Layout and type/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { header, sidebar: sidebar(), footer: '© 2026 Acme', children: content, mainId: 'shell-playground' },
  argTypes: { header: { control: false }, sidebar: { control: false }, footer: { control: false }, bottomNav: { control: false }, children: { control: false }, background: { control: 'inline-radio', options: ['plain', 'muted'] }, sidebarFrom: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The default: a skip link, the Navbar, the Sidebar beside main from 640px, and the footer, on the plain page for content people read or fill in. */
export const Default: Story = { args: { mainId: 'shell-default' } };

/** background="muted": a dashboard built from Cards, so each Card's edge stands off the page. The bars around it stay plain. */
export const MutedForCards: Story = {
  name: 'Muted, for Cards',
  args: {
    background: 'muted', mainId: 'shell-muted',
    children: <Stack gap={6}>
      <Heading level={1}>Dashboard</Heading>
      <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        {['Revenue', 'Orders', 'Visitors'].map((t) => <Card key={t} as="section" aria-label={t}><p className="m-0 text-sm text-text-muted">{t}</p><p className="m-0 text-2xl font-semibold">1,204</p></Card>)}
      </Grid>
    </Stack>,
  },
};

/** The Sidebar collapsed to its icon rail, for more room in main. */
export const CollapsedSidebar: Story = { args: { sidebar: sidebar(true), mainId: 'shell-collapsed' } };

/** Adaptive: the Sidebar from 768px and a BottomNav below it, with the same places in the same order. Make the window narrower to see it switch. */
export const WithBottomNav: Story = {
  name: 'With a BottomNav',
  args: {
    sidebarFrom: 'md', mainId: 'shell-bottom',
    bottomNav: <BottomNav aria-label="Workspace phone" hideFrom="md">
      <BottomNavLink href="#home" icon="home" current>Home</BottomNavLink>
      <BottomNavLink href="#projects" icon="folder">Projects</BottomNavLink>
      <BottomNavLink href="#team" icon="group">Team</BottomNavLink>
    </BottomNav>,
  },
};

/** No sidebar and padded={false}: a header, a full-width main for content that brings its own padding, and the footer. */
export const NoSidebar: Story = { name: 'No sidebar', args: { sidebar: undefined, padded: false, mainId: 'shell-nosidebar', children: <div className="bg-surface-sunken p-6">{content}</div> } };

/** The stress story: a long page title and a long footer wrap inside main and the footer, and the Sidebar stays put beside them. */
export const LongText: Story = {
  args: {
    mainId: 'shell-long',
    children: <Stack gap={4}><Heading level={1} className="wrap-anywhere">Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung</Heading><p className="m-0 wrap-anywhere">Rechtsschutzversicherungsgesellschaften and a paragraph long enough to wrap several times inside main.</p></Stack>,
    footer: '© 2026 Acme Incorporated, every right reserved, with a footer line long enough to wrap onto a second line on a phone.',
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: the muted background behind a page built from Cards. */
export const DoMutedCards: Story = { name: 'Do: muted behind Cards', args: { ...MutedForCards.args, mainId: 'shell-do' } };
/** Don't: Cards on the plain background: their edges barely show. */
export const DontPlainCards: Story = { tags: ['!visual'], name: "Don't: Cards on the plain page", args: { ...MutedForCards.args, background: 'plain', mainId: 'shell-dont' } };
