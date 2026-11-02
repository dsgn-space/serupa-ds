import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Illustration } from './Illustration';
import { EmptyState } from '../EmptyState/EmptyState';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Feedback/Illustration',
  component: Illustration,
  args: { name: 'empty' },
} satisfies Meta<typeof Illustration>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Empty: Story = {};
export const Search: Story = { args: { name: 'search' } };
export const ErrorPicture: Story = { name: 'Error', args: { name: 'error' } };
export const Offline: Story = { args: { name: 'offline' } };
export const NoAccess: Story = { args: { name: 'no-access' } };
export const Success: Story = { args: { name: 'success' } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: 24 }}>
      <Illustration {...args} size="sm" />
      <Illustration {...args} size="md" />
      <Illustration {...args} size="lg" />
    </div>
  ),
};
export const InEmptyState: Story = {
  render: () => (
    <EmptyState
      icon={<Illustration name="search" />}
      title="No results for “mars”"
      description="Check the spelling or try a broader search."
      actions={<Button variant="outline">Clear search</Button>}
    />
  ),
};
// The stress story (G14): a long label on a small picture. The label isn't drawn, so the picture must not change.
export const LongText: Story = { args: { size: 'sm', label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung: nothing here yet, and a label long enough to wrap twice' } };
