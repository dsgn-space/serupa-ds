import type { Meta, StoryObj } from '@storybook/react-vite';
import { Recipe } from './Recipe';

/* Recipe: the facts, ingredients that rescale for how many you're cooking for, and steps to tick off. Recipe.mdx says
   why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Recipe',
  component: Recipe,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Recipe>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A soup for four. */
export const Default: Story = {};
