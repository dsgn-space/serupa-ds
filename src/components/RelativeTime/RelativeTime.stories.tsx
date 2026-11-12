import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RelativeTime } from './RelativeTime';

const minutes = (n: number) => Date.now() - n * 60 * 1000;
const meta = {
  title: 'Components/Content/RelativeTime',
  component: RelativeTime,
  args: { date: minutes(3) },
  argTypes: { format: { control: 'inline-radio', options: ['long', 'short', 'narrow'] }, numeric: { control: 'inline-radio', options: ['auto', 'always'] } },
} satisfies Meta<typeof RelativeTime>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Range: Story = {
  render: () => <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', margin: 0, paddingInlineStart: 'var(--spacing-5)' }}>
    {[0, 3, 90, 60 * 26, 60 * 24 * 5, 60 * 24 * 45, -120].map((m) => <li key={m}><RelativeTime date={minutes(m)} /></li>)}
  </ul>,
};
export const InASentence: Story = {
  name: 'In a sentence',
  render: () => <p style={{ margin: 0 }}>Edited by Ada <RelativeTime date={minutes(42)} />. Next sync <RelativeTime date={minutes(-15)} />.</p>,
};

export const LongText: Story = {
  render: () => (
    <p style={{ margin: 0, width: 100 }}>
      Edited <RelativeTime date={Date.now() - 400 * 24 * 60 * 60 * 1000} format="long" numeric="always" absoluteAfter={false} />, by someone else.
    </p>
  ),
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: \`numeric="always"\` in a log, where elapsed time matters more than the calendar. */
export const DoNumericInLogs: Story = { name: 'Do: count time in logs', args: { date: minutes(1440), numeric: 'always' }, render: (args) => <p style={{ margin: 0 }}>Backup finished <RelativeTime {...args} /></p> };
/** Don't: calendar words in a log, which say less about how long ago it was. */
export const DontCalendarWordsInLogs: Story = { name: "Don't: use calendar words in logs", args: { date: minutes(1440) }, render: (args) => <p style={{ margin: 0 }}>Backup finished <RelativeTime {...args} /></p> };
