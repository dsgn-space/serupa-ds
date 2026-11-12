import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Alert } from '../Alert/Alert';
import { Button } from '../Button/Button';
import { Loader } from '../Loader/Loader';
import { Timeline, TimelineItem } from './Timeline';

const events = <>
  <TimelineItem title="Order placed" time="12 Mar, 09:14" dateTime="2026-03-12T09:14" status="primary" icon="shopping_cart">Two items, paid by card.</TimelineItem>
  <TimelineItem title="Payment confirmed" time="12 Mar, 09:15" dateTime="2026-03-12T09:15" status="success" icon="check" />
  <TimelineItem title="Delivery delayed" time="13 Mar, 18:40" dateTime="2026-03-13T18:40" status="warning" icon="schedule">The courier missed the evening run. New estimate: 15 March.</TimelineItem>
  <TimelineItem title="Out for delivery" time="15 Mar, 08:02" dateTime="2026-03-15T08:02" />
</>;

const meta = {
  title: 'Components/Data display/Timeline',
  component: Timeline,
  args: { children: events, 'aria-label': 'Order history' },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Dots instead of icons, in each status color. */
export const Dots: Story = {
  args: {
    children: <>
      <TimelineItem title="Neutral" time="Now" />
      <TimelineItem title="Primary" time="1 minute ago" status="primary" />
      <TimelineItem title="Success" time="5 minutes ago" status="success" />
      <TimelineItem title="Warning" time="1 hour ago" status="warning" />
      <TimelineItem title="Danger" time="Yesterday" status="danger" />
      <TimelineItem title="Info" time="Last week" status="info" />
    </>,
  },
};
/** Events along a line, for milestones and order tracking. Past the width it has, it scrolls sideways in its own box. */
export const Horizontal: Story = { args: { orientation: 'horizontal', 'aria-label': 'Order tracking' } };
/** stackWhenNarrow: in a box under 480px wide, the events go down a line instead of scrolling. */
export const HorizontalStacked: Story = {
  name: 'Horizontal, stacked when narrow',
  args: { orientation: 'horizontal', stackWhenNarrow: true, 'aria-label': 'Order tracking' },
  render: (args) => <div style={{ maxWidth: 360 }}><Timeline {...args} /></div>,
};
/** From 768px up, events take turns on either side of a centered line. */
export const Alternate: Story = { args: { align: 'alternate' } };

export const LongText: Story = {
  args: {
    children: <>
      <TimelineItem title="Order placed for delivery to the warehouse on the far side of town" time="12 Mar, 09:14" dateTime="2026-03-12T09:14" status="primary" icon="shopping_cart">Two items, paid by card. Donaudampfschifffahrtsgesellschaftskapitänskajüte.</TimelineItem>
      <TimelineItem title="Donaudampfschifffahrtsgesellschaftskapitänskajüte" time="13 Mar, 18:40" dateTime="2026-03-13T18:40" status="warning" icon="schedule" />
    </>,
  },
  render: (args) => <div style={{ width: 240 }}><Timeline {...args} /></div>,
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: the status in the title, so it reads without the marker's color. */
export const DoStatusInTitle: Story = { name: 'Do: say the status in the title' };
/** Don't: a generic title where only the marker's color says something went wrong. */
export const DontColorOnly: Story = {
  name: "Don't: status only in the color",
  args: { children: <>
    <TimelineItem title="Update" time="12 Mar, 09:14" dateTime="2026-03-12T09:14" status="primary">Two items, paid by card.</TimelineItem>
    <TimelineItem title="Update" time="12 Mar, 09:15" dateTime="2026-03-12T09:15" status="success" />
    <TimelineItem title="Update" time="13 Mar, 18:40" dateTime="2026-03-13T18:40" status="warning">New estimate: 15 March.</TimelineItem>
    <TimelineItem title="Update" time="15 Mar, 08:02" dateTime="2026-03-15T08:02" />
  </> },
};

// Loading and failed: skeleton titles and times hold each event's place, and a failure offers Retry.
function States(args: React.ComponentProps<typeof Timeline>) {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'failed'>('loading');
  return (
    <div style={{ maxWidth: 560, display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['loading', 'loaded', 'failed'] as const).map((s) => <Button key={s} size="sm" variant={s === state ? 'primary' : 'secondary'} aria-pressed={s === state} onClick={() => setState(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>)}
      </div>
      {state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={() => setState('loading')}>Retry</Button>}>The order history didn't load. Check your connection and try again.</Alert>
        : state === 'loaded' ? <Timeline {...args} />
        : <Timeline {...args} aria-busy>
            {[0, 1, 2, 3].map((i) => <TimelineItem key={i}
              title={<Loader variant="skeleton" size="lg" className="w-1/2" label={i === 0 ? 'Loading history' : ''} />}
              time={<Loader variant="skeleton" size="md" className="w-24" label="" />} />)}
          </Timeline>}
    </div>
  );
}
/** Loading: skeleton titles and times, so nothing moves when the events arrive. Failed: an Alert with Retry. */
export const LoadingAndErrors: Story = { name: 'Loading and failed', render: (args) => <States {...args} /> };
