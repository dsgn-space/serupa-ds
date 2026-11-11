import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster, toast } from '../Toast';
import { BottomNav, BottomNavLink } from './BottomNav';

const Page = () => (
  <main style={{ padding: 16 }}>
    <h1 style={{ margin: '0 0 8px', fontSize: 'var(--text-xl)' }}>Inbox</h1>
    {Array.from({ length: 4 }, (_, i) => <p key={i} style={{ margin: '0 0 12px' }}>Message {i + 1}: the page scrolls under the bar, and the spacer keeps its last line clear of it.</p>)}
  </main>
);

function WithToastDemo(args: React.ComponentProps<typeof BottomNav>) {
  React.useEffect(() => { toast({ title: 'Message archived', duration: 0 }); return () => toast.dismiss(); }, []);
  return <><Bar {...args} /><Toaster position="bottom-center" /></>;
}

function Bar(args: React.ComponentProps<typeof BottomNav>) {
  return (
    <>
      <Page />
      <BottomNav {...args}>
        <BottomNavLink href="#home" icon="home">Home</BottomNavLink>
        <BottomNavLink href="#inbox" icon="inbox" active>Inbox</BottomNavLink>
        <BottomNavLink href="#search" icon="search">Search</BottomNavLink>
        <BottomNavLink href="#account" icon="person">Account</BottomNavLink>
      </BottomNav>
    </>
  );
}

const meta = {
  title: 'Components/Navigation/BottomNav',
  component: BottomNav,
  parameters: { layout: 'fullscreen' },
  // Stories show it at every width, so the screenshots (wider than a phone) have it; on a page it hides from 768px.
  args: { label: 'Main', hideFrom: false },
  render: (args) => <Bar {...args} />,
} satisfies Meta<typeof BottomNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Four destinations, Inbox current. */
export const Default: Story = {};
/** A bottom Toaster sits above the bar, not under it. */
export const WithToast: Story = {
  render: (args) => <WithToastDemo {...args} />,
};
// The stress story (G14): five links with long labels; each label cuts with an ellipsis in its own column.
export const LongText: Story = {
  render: (args) => (
    <>
      <Page />
      <BottomNav {...args}>
        <BottomNavLink href="#a" icon="home" active>Donaudampfschifffahrtsgesellschaft</BottomNavLink>
        <BottomNavLink href="#b" icon="inbox">Notifications and messages</BottomNavLink>
        <BottomNavLink href="#c" icon="search">Search</BottomNavLink>
        <BottomNavLink href="#d" icon="calendar_today">Calendar</BottomNavLink>
        <BottomNavLink href="#e" icon="person">Account settings</BottomNavLink>
      </BottomNav>
    </>
  ),
};
