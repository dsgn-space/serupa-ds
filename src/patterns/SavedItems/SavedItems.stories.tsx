import type { Meta, StoryObj } from '@storybook/react-vite';
import { SavedItems } from './SavedItems';

/* Saved items: things kept for later, what changed since in words, Move to cart, and Remove with Undo.
   SavedItems.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Saved items',
  component: SavedItems,
  parameters: { layout: 'fullscreen' },
  args: { onMoveToCart: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof SavedItems>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four items: one cheaper than when saved, one with few left, one sold out. */
export const Default: Story = {};

/** Nothing saved yet. */
export const Empty: Story = { args: { items: [] } };

/** While the saved items load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
