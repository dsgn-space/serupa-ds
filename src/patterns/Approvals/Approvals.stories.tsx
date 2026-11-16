import type { Meta, StoryObj } from '@storybook/react-vite';
import { Approvals } from './Approvals';

/* Approvals: requests waiting on you, approved with Undo or declined with a reason. Approvals.mdx says why each part
   is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Approvals',
  component: Approvals,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Approvals>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three requests waiting: an expense, leave and a purchase. */
export const Default: Story = {};

/** Nothing waiting. */
export const CaughtUp: Story = { args: { requests: [] } };
