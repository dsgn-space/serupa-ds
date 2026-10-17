import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Navbar, NavbarLink } from './Navbar';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';

const links = [
  <NavbarLink key="d" href="#" active>Dashboard</NavbarLink>,
  <NavbarLink key="p" href="#">Projects</NavbarLink>,
  <NavbarLink key="t" href="#">Team</NavbarLink>,
  <NavbarLink key="r" href="#">Reports</NavbarLink>,
];

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  subcomponents: { NavbarLink } as any,
  parameters: { layout: 'fullscreen' },
  args: {
    brand: <a href="#" className="text-base font-semibold text-text no-underline">Acme</a>,
    actions: <><Button variant="ghost" size="sm">Docs</Button><Avatar name="Ada Lovelace" size="sm" /></>,
    children: links,
  },
  argTypes: { size: { control: 'select', options: ['md', 'lg', 'xl', '2xl', 'full'] }, brand: { control: false }, actions: { control: false }, children: { control: false } },
} satisfies Meta<typeof Navbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SmallScreen: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } }, render: (args) => <div style={{ maxWidth: 375, minHeight: 280 }}><Navbar {...args} /></div> };

export const SignedOut: Story = { args: { actions: <><Button variant="ghost" size="sm">Sign in</Button><Button size="sm">Sign up</Button></> } };
