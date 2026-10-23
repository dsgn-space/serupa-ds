import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from './VisuallyHidden';
import { Icon } from '../Icon/Icon';

const meta = {
  title: 'Components/Layout and type/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: 'unread messages' },
  render: (args) => <p className="text-sm text-text">3 <VisuallyHidden {...args} /> <span aria-hidden>(a screen reader says "3 unread messages")</span></p>,
} satisfies Meta<typeof VisuallyHidden>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const IconLabel: Story = {
  render: () => <a href="#" className="inline-flex text-text"><Icon name="settings" /><VisuallyHidden>Settings</VisuallyHidden></a>,
};

export const SkipLink: Story = {
  render: () => (
    <div className="text-sm text-text">
      <p>Press Tab to show the skip link.</p>
      <VisuallyHidden focusable as="div"><a href="#main" className="text-primary underline">Skip to content</a></VisuallyHidden>
    </div>
  ),
};
