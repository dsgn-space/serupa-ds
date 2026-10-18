import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';

const meta = {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  args: {
    icon: 'folder_open',
    title: 'No projects yet',
    description: 'Create a project to start tracking your work.',
    actions: <><Button leftIcon="add">New project</Button><Button variant="outline">Import</Button></>,
  },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] }, variant: { control: 'inline-radio', options: ['plain', 'dashed'] }, actions: { control: false }, icon: { control: 'text' } },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const NoResults: Story = {
  render: () => (
    <Card style={{ maxWidth: 480 }}>
      <EmptyState size="sm" icon="search_off" title="No results" description={'Nothing matches "quarterly".'} actions={<Button variant="outline" size="sm">Clear the search</Button>} />
    </Card>
  ),
};

export const Dashed: Story = { args: { variant: 'dashed', icon: 'upload', title: 'Drop files here', description: 'PNG, JPG or PDF, up to 10 MB.', actions: <Button variant="outline">Choose files</Button> } };
