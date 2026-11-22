import type { Meta, StoryObj } from '@storybook/react-vite';
import { Agenda } from './Agenda';

/* Conference agenda: each day's sessions by time, a track filter, your own agenda, and clashes said. Agenda.mdx says
   why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Conference agenda',
  component: Agenda,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Agenda>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing saved yet. */
export const Default: Story = {};

/** Two saved sessions that overlap: both say so. */
export const Clash: Story = { args: { defaultSaved: ['k1', 'a1', 'b1'] } };

/** While the sessions load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** Nothing on the agenda yet: what goes here, before the sessions are announced. */
export const Empty: Story = { args: { sessions: [] } };
