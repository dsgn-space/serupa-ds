import type { Meta, StoryObj } from '@storybook/react-vite';
import { StockCount } from './StockCount';

/* StockCount: a shop's stock counted into a grid, what differs from the record, the row size and the columns to show.
   StockCount.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Stock count',
  component: StockCount,
  parameters: { layout: 'fullscreen' },
  args: { onSave: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof StockCount>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Halfway through: three counted, one of them short. */
export const Default: Story = {};

/** Partly loaded: the products came, the counts so far didn't yet. Every Counted cell is blank to fill. */
export const Partial: Story = { args: { items: [
  { id: 'a', sku: 'KP-001', name: 'Toraja coffee, 250 g', location: 'Aisle 1, shelf A', expected: 42, counted: null },
  { id: 'b', sku: 'KP-002', name: 'Gayo coffee, 250 g', location: 'Aisle 1, shelf A', expected: 18, counted: null },
  { id: 'c', sku: 'TH-010', name: 'Jasmine tea, 100 g', location: 'Aisle 1, shelf B', expected: 120, counted: null },
] } };

/** Saving fails: it says so where Save is, and every count stays. */
export const SaveFails: Story = { tags: ['!visual'], args: { onSave: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** While the stock loads: placeholder rows in the grid. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Nothing stocked at this place yet. */
export const Empty: Story = { args: { items: [] } };

/** Offline: counting goes on, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
