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

// The content it skips to is the example's own (useId), so the link stays inside it wherever it's shown.
export const SkipLink: Story = {
  render: function Render() {
    const content = React.useId();
    return (
      <div className="text-sm text-text">
        <p>Press Tab to show the skip link.</p>
        <VisuallyHidden focusable as="div"><a href={`#${content}`} className="text-text-brand underline">Skip to content</a></VisuallyHidden>
        <div id={content} tabIndex={-1}>The content.</div>
      </div>
    );
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: the hidden words right after what they explain, so they read in order. */
export const DoRightAfter: Story = { name: 'Do: put it right after what it explains' };
/** Don't: hidden words far from what they explain, which then read out of order. */
export const DontFarAway: Story = { tags: ['!visual'],
  name: "Don't: put it far from what it explains",
  render: () => <p className="text-sm text-text"><VisuallyHidden>unread messages</VisuallyHidden> In your inbox: 3</p>,
};
