import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreLocator } from './StoreLocator';

/* Store locator: a search, your location, shops as a list with open or closed in words, hours and directions.
   StoreLocator.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Store locator',
  component: StoreLocator,
  parameters: { layout: 'fullscreen' },
  args: { now: new Date(2026, 1, 11, 19, 30), locate: () => new Promise((ok) => setTimeout(() => ok({ lat: -6.2297, lng: 106.8295 }), 500)) },
} satisfies Meta<typeof StoreLocator>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A Wednesday evening: three shops open, one closing soon. "Use my location" sorts them by distance. */
export const Default: Story = {};

/** The browser won't share where you are: it says so, and what to do instead. */
export const NoLocation: Story = { args: { locate: () => new Promise((_, no) => setTimeout(() => no(new Error('denied')), 300)) } };
