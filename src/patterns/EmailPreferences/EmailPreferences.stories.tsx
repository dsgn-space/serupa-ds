import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmailPreferences } from './EmailPreferences';

/* Email preferences: what's sent to an address, a switch for each kind, Save, and one button to stop them all.
   EmailPreferences.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Email preferences',
  component: EmailPreferences,
  parameters: { layout: 'fullscreen' },
  args: { onSave: () => new Promise((ok) => setTimeout(ok, 500)) },
} satisfies Meta<typeof EmailPreferences>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four kinds of email, three on. */
export const Default: Story = {};

/** Saving fails: it says so, and the switches stay as set. */
export const SaveFails: Story = { args: { onSave: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 500)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
