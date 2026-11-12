import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar, NavbarLink, NavbarMenu, NavbarMenuGroup, NavbarMenuLink } from './Navbar';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';
import { useName } from '../../../.storybook/content';

const links = [
  <NavbarLink key="d" href="#" active>Dashboard</NavbarLink>,
  <NavbarLink key="p" href="#">Projects</NavbarLink>,
  <NavbarLink key="t" href="#">Team</NavbarLink>,
  <NavbarLink key="r" href="#">Reports</NavbarLink>,
];

// The signed-in person follows Storybook's Content menu (.storybook/content.ts).
const Me = () => <Avatar name={useName('Ada Lovelace')} size="sm" />;

const meta = {
  title: 'Components/Navigation/Navbar',
  component: Navbar,
  subcomponents: { NavbarLink, NavbarMenu, NavbarMenuGroup, NavbarMenuLink },
  parameters: { layout: 'fullscreen' },
  args: {
    brand: <a href="#" className="text-base font-semibold text-text no-underline">Acme</a>,
    actions: <><Button variant="ghost" size="sm">Docs</Button><Me /></>,
    children: links,
  },
  argTypes: { size: { control: 'select', options: ['md', 'lg', 'xl', '2xl', 'full'] }, brand: { control: false }, actions: { control: false }, children: { control: false } },
} satisfies Meta<typeof Navbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SmallScreen: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } }, render: (args) => <div style={{ maxWidth: 375, minHeight: 280 }}><Navbar {...args} /></div> };

export const SignedOut: Story = { args: { actions: <><Button variant="ghost" size="sm">Sign in</Button><Button size="sm">Sign up</Button></> } };

export const Overflow: Story = {
  args: {
    brand: <a href="#" className="text-base font-semibold text-text no-underline">Acme Corporation International</a>,
    children: [...links, <NavbarLink key="s" href="#">Settings and billing</NavbarLink>, <NavbarLink key="w" href="#">Donaudampfschifffahrtsgesellschaftskapitänskajüte</NavbarLink>],
  },
  render: (args) => <div style={{ maxWidth: 360 }}><Navbar {...args} /></div>,
};

export const Sizes: Story = {
  render: (args) => <div className="flex flex-col gap-4">
    {(['prose', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((size) => <Navbar key={size} {...args} size={size} aria-label={`Main, ${size}`} brand={<a href="#" className="text-base font-semibold text-text no-underline">size="{size}"</a>} />)}
  </div>,
};

// Dropdown panels (a mega menu): a nav item opens grouped links, each with a line saying what's there.
const menus = [
  <NavbarLink key="d" href="#m1" active>Dashboard</NavbarLink>,
  <NavbarMenu key="p" label="Products">
    <NavbarMenuGroup title="Analytics">
      <NavbarMenuLink href="#m2" description="Charts and reports for your team">Dashboards</NavbarMenuLink>
      <NavbarMenuLink href="#m3" description="Get told when a number moves">Alerts</NavbarMenuLink>
    </NavbarMenuGroup>
    <NavbarMenuGroup title="Payments">
      <NavbarMenuLink href="#m4" description="Invoices, plans and receipts">Billing</NavbarMenuLink>
      <NavbarMenuLink href="#m5" description="Card, bank transfer and QRIS">Checkout</NavbarMenuLink>
    </NavbarMenuGroup>
  </NavbarMenu>,
  <NavbarMenu key="r" label="Resources">
    <NavbarMenuLink href="#m6">Docs</NavbarMenuLink>
    <NavbarMenuLink href="#m7">Blog</NavbarMenuLink>
  </NavbarMenu>,
  <NavbarLink key="t" href="#m8">Team</NavbarLink>,
];
export const Menus: Story = { args: { children: menus }, render: (args) => <div style={{ minHeight: 320 }}><Navbar {...args} /></div> };
export const MenusSmallScreen: Story = { name: 'Menus, small screen', args: { children: menus }, render: (args) => <div style={{ maxWidth: 375, minHeight: 280 }}><Navbar {...args} /></div> };

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: links to the main pages only, a word or two each. */
export const DoFewLinks: Story = { name: 'Do: keep to the main pages' };
/** Don't: every page in the bar, which folds most of them away and buries the main ones. */
export const DontEveryPage: Story = {
  name: "Don't: put every page in the bar",
  args: { children: ['Dashboard', 'Projects', 'Team', 'Reports', 'Billing', 'Integrations', 'Audit log', 'Settings', 'Help center'].map((l, i) => <NavbarLink key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} active={i === 0}>{l}</NavbarLink>) },
};
