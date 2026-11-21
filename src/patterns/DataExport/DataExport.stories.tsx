import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataExport } from './DataExport';

/* Download your data: what to include and the format, its size, asking for it, and the exports asked for before.
   DataExport.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Download your data',
  component: DataExport,
  parameters: { layout: 'fullscreen' },
  args: { today: '2026-11-16' },
} satisfies Meta<typeof DataExport>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Everything chosen, with one export ready and one run out. */
export const Default: Story = {};

/** Nothing asked for yet. */
export const FirstTime: Story = { args: { exports: [] } };

/** A request that can't be taken says so and keeps the choices. */
export const RequestFails: Story = { args: { onRequest: () => Promise.reject(new Error('offline')) } };

/** While the exports load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
