import type { Meta, StoryObj } from '@storybook/react-vite';
import { Leaderboard } from './Leaderboard';

/* Leaderboard: the top places by period, where you are, ties and moves in words. Leaderboard.mdx says why each part is
   there and what stays the app's job. */
const meta = {
  title: 'Patterns/Leaderboard',
  component: Leaderboard,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Leaderboard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** You're outside the top five. */
export const Default: Story = {};

/** You're in the top five. */
export const InTheTop: Story = { args: { me: 'sara' } };

/** While the board load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** Nobody has scored yet: what earns a place. */
export const Empty: Story = { args: { players: [] } };
