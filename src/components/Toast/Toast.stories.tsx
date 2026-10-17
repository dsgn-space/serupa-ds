import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast, Toaster } from './Toast';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Toast',
  component: Toaster,
  args: { position: 'bottom-end' },
  argTypes: { position: { control: 'select', options: ['bottom-end', 'bottom-start', 'bottom-center', 'top-start', 'top-center', 'top-end'] } },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Toaster {...args} />
      <Button variant="secondary" onClick={() => toast('Link copied')}>Neutral</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Changes saved', tone: 'success' })}>Success</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'New version available', description: 'Reload to update.', tone: 'info' })}>Info</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Storage almost full', tone: 'warning' })}>Warning</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Upload failed', description: 'The file is over 10 MB.', tone: 'danger', duration: 0 })}>Danger</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Moved to trash', action: { label: 'Undo', onClick: () => toast('Restored') } })}>With an action</Button>
    </div>
  ),
} satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
