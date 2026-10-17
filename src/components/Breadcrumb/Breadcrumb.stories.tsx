import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem } as any,
  args: {
    children: [
      <BreadcrumbItem key="h" href="#" icon="home">Home</BreadcrumbItem>,
      <BreadcrumbItem key="p" href="#">Projects</BreadcrumbItem>,
      <BreadcrumbItem key="w">Website redesign</BreadcrumbItem>,
    ],
  },
  argTypes: { separator: { control: 'inline-radio', options: ['chevron', 'slash'] }, children: { control: false } },
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
