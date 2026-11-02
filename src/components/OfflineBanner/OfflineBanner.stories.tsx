import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Button } from '../Button/Button';
import { OfflineBanner } from './OfflineBanner';

const meta = {
  title: 'Components/Feedback/OfflineBanner',
  component: OfflineBanner,
  args: { online: false, placement: 'inline' },
} satisfies Meta<typeof OfflineBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

// Offline, so the bar shows. Clear online in the controls and it follows the browser instead: turn the network off in
// the developer tools (Network, Offline) to see it. Online it renders nothing, so a story left online is an empty page.
export const Playground: Story = { args: { online: false, placement: 'bottom', children: "Changes are kept and sent when you're back." } };

// The stories set online={false} so the bar shows; an app leaves it out.
export const Default: Story = {};

export const WithMoreWords: Story = {
  args: { children: "Changes are kept on this device and sent when you're back." },
};

// Drops and comes back on a button, as it would on the network: "Back online" shows for a moment, then it slides away.
export const DropAndReturn: Story = {
  tags: ['!visual'],
  args: { online: undefined },
  render: function Render(args) {
    const [online, setOnline] = React.useState(true);
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
        <Button size="sm" variant="secondary" onClick={() => setOnline(!online)}>{online ? 'Drop the connection' : 'Bring it back'}</Button>
        <OfflineBanner {...args} online={online} placement="inline" />
      </div>
    );
  },
};

// The stress story (G14): long words in a narrow column wrap under the first line, the icon stays on it.
export const LongText: Story = {
  args: { children: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung forms are kept on this device and sent when the connection comes back.' },
  render: (args) => <div style={{ maxWidth: 260 }}><OfflineBanner {...args} /></div>,
};
