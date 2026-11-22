import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Countdown } from './Countdown';

/* The stories pass `seconds`, the time left as the app's own clock gives it, so each picture is the same on every
   run. With `to` instead, a Countdown keeps its own clock and ticks: see the README. */
const meta = {
  title: 'Components/Data display/Countdown',
  component: Countdown,
  args: { seconds: 4 * 60 + 59, label: 'Offer ends in' },
  render: (args) => <p className="m-0">Offer ends in <Countdown {...args} /></p>,
} satisfies Meta<typeof Countdown>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Under an hour: minutes and seconds, "4:59". */
export const Default: Story = {};
/** Live: `to` gives the end time, and the Countdown keeps its own clock and ticks, five minutes from when it's shown.
 *  Left out of the pictures, which would differ every second. */
export const Live: Story = {
  tags: ['!visual'],
  args: { seconds: undefined },
  render: function Render(args) {
    const [to] = React.useState(() => Date.now() + 5 * 60 * 1000);
    return <p className="m-0">Offer ends in <Countdown {...args} to={to} /></p>;
  },
};
/** An hour or more: hours too, "1:04:59". */
export const Hours: Story = { args: { seconds: 3600 + 4 * 60 + 59 } };
/** In words, "4 minutes, 59 seconds", where a clock could be misread or there's room. */
export const Words: Story = { args: { format: 'words' } };
/** Ended: endText in place of the time, and said aloud as it ends. */
export const Ended: Story = { args: { seconds: 0, endText: 'The offer has ended' }, render: (args) => <p className="m-0"><Countdown {...args} /></p> };
// The stress story (G14): days in words in a narrow column; they wrap between units, never inside one.
export const LongText: Story = {
  args: { seconds: 2 * 86400 + 3 * 3600 + 4 * 60 + 5, format: 'words', label: 'Registration closes in' },
  render: (args) => <p className="m-0 w-40">Registration closes in <Countdown {...args} /></p>,
};
/** Don't: the clock alone, which reads as a time of day. */
export const DontBareClock: Story = { tags: ['!visual'], name: "Don't: the clock alone", render: (args) => <p className="m-0"><Countdown {...args} /></p> };
