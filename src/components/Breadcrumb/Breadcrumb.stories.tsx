import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem },
  args: {
    children: [
      <BreadcrumbItem key="h" href="#" icon="home">Home</BreadcrumbItem>,
      <BreadcrumbItem key="p" href="#">Projects</BreadcrumbItem>,
      <BreadcrumbItem key="w">Website redesign</BreadcrumbItem>,
    ],
  },
  argTypes: { separator: { control: 'inline-radio', options: ['chevron', 'slash'] }, collapse: { control: 'inline-radio', options: ['inline', 'menu'] }, children: { control: false } },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Slash: Story = { args: { separator: 'slash' } };

export const Collapsed: Story = {
  args: {
    maxItems: 3,
    children: ['Home', 'Acme', 'Design', 'Projects', 'Website redesign', 'Settings'].map((l, i, a) => <BreadcrumbItem key={l} href={i < a.length - 1 ? '#' : undefined}>{l}</BreadcrumbItem>),
  },
};

/** collapse="menu": "…" opens a menu of the hidden pages, and the trail stays on one line. */
export const CollapsedMenu: Story = {
  args: {
    maxItems: 3,
    collapse: 'menu',
    children: ['Home', 'Acme', 'Design', 'Projects', 'Website redesign', 'Settings'].map((l, i, a) => <BreadcrumbItem key={l} href={i < a.length - 1 ? '#' : undefined}>{l}</BreadcrumbItem>),
  },
};

export const LongLabels: Story = {
  name: 'Long labels',
  args: {
    children: [
      <BreadcrumbItem key="h" href="#" icon="home">Home</BreadcrumbItem>,
      <BreadcrumbItem key="c" href="#">Customer research and interviews, autumn</BreadcrumbItem>,
      <BreadcrumbItem key="n">Notes from the session with the support team about the new onboarding</BreadcrumbItem>,
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-sm)' }}><Story /></div>],
};

export const TwoLevels: Story = {
  name: 'Two levels',
  args: { children: [<BreadcrumbItem key="p" href="#">Projects</BreadcrumbItem>, <BreadcrumbItem key="w">Website redesign</BreadcrumbItem>] },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: each item is the title people see on that page, ending with the current page. */
export const DoPageTitles: Story = {
  name: 'Do: use the pages’ titles',
  args: { children: [
    <BreadcrumbItem key="h" href="/">Home</BreadcrumbItem>,
    <BreadcrumbItem key="p" href="/projects">Projects</BreadcrumbItem>,
    <BreadcrumbItem key="w" href="/projects/website">Website redesign</BreadcrumbItem>,
    <BreadcrumbItem key="s">Settings</BreadcrumbItem>,
  ] },
};
/** Don't: names that don't match the pages, such as "Back" or "Page", or a trail that stops short of the current page. */
export const DontMadeUpNames: Story = {
  name: "Don't: make up names",
  args: { children: [
    <BreadcrumbItem key="h" href="/">Start</BreadcrumbItem>,
    <BreadcrumbItem key="p" href="/projects">List</BreadcrumbItem>,
    <BreadcrumbItem key="w">Back</BreadcrumbItem>,
  ] },
};
