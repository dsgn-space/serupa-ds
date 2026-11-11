import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabNav, TabNavLink } from './TabNav';
import { Link } from '../Link/Link';

const meta = {
  title: 'Components/Navigation/TabNav',
  component: TabNav,
  args: { variant: 'line', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'pill'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => (
    <TabNav {...args} aria-label="Project" style={{ maxWidth: 520 }}>
      <TabNavLink href="#overview" current>Overview</TabNavLink>
      <TabNavLink href="#activity" icon="history">Activity</TabNavLink>
      <TabNavLink href="#members">Members</TabNavLink>
      <TabNavLink href="#settings">Settings</TabNavLink>
    </TabNav>
  ),
} satisfies Meta<typeof TabNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = {};
export const Pill: Story = { args: { variant: 'pill', size: 'sm' } };
/** 44px links with 16px text, beside large fields and buttons or on a touch screen. */
export const Large: Story = { args: { size: 'lg' } };
/** More links than fit: the row scrolls, the edge with more links fades out, and the current one is scrolled into view. */
export const LongLabels: Story = {
  render: (args) => (
    <TabNav {...args} aria-label="Repository" style={{ maxWidth: 320 }}>
      <TabNavLink href="#code">Code</TabNavLink>
      <TabNavLink href="#issues">Issues</TabNavLink>
      <TabNavLink href="#requests">Merge requests</TabNavLink>
      <TabNavLink href="#pipelines">Pipelines</TabNavLink>
      <TabNavLink href="#wiki">Donaudampfschifffahrtsgesellschaft</TabNavLink>
      <TabNavLink href="#settings" current>Settings</TabNavLink>
    </TabNav>
  ),
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: the current page marked with the tab line. */
export const DoTabLine: Story = { name: 'Do: the tab line' };
/** Don't: a row of plain links, with only a bolder weight on the current one. */
export const DontPlainLinks: Story = {
  name: "Don't: plain links",
  render: () => (
    <nav aria-label="Project">
      <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
        <li><Link href="#overview" aria-current="page" className="font-semibold">Overview</Link></li>
        <li><Link href="#activity" className="no-underline">Activity</Link></li>
        <li><Link href="#members" className="no-underline">Members</Link></li>
        <li><Link href="#settings" className="no-underline">Settings</Link></li>
      </ul>
    </nav>
  ),
};
