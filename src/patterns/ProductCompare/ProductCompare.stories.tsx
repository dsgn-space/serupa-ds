import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCompare } from './ProductCompare';

/* Product compare: products in columns, features in rows, values in words, and "Only what differs".
   ProductCompare.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Product compare',
  component: ProductCompare,
  parameters: { layout: 'fullscreen' },
  args: { onAddToCart: () => new Promise((ok) => setTimeout(ok, 400)) },
} satisfies Meta<typeof ProductCompare>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three headphones: one value missing, said as "Not said". */
export const Default: Story = {};

/** Nothing left to compare. */
export const Empty: Story = { args: { products: [] } };
