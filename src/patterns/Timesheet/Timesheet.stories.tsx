import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timesheet } from './Timesheet';

/* Timesheet: a week's hours by project and day, the totals, and sending it for approval. Timesheet.mdx says why each
   part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Timesheet',
  component: Timesheet,
  parameters: { layout: 'fullscreen' },
  args: { onSend: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof Timesheet>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Tuesday evening: two days filled in. */
export const Default: Story = {};

/** A new week, nothing in it yet. */
export const Empty: Story = { args: { defaultHours: {} } };

/** Sending fails: it says so, and every hour stays. */
export const SendFails: Story = { args: { onSend: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };
