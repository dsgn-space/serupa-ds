import type { Meta, StoryObj } from '@storybook/react-vite';
import { JobApplication } from './JobApplication';

/* Job application: what the job is, one short form with a CV, a summary of what's missing, and what happens next.
   JobApplication.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Job application',
  component: JobApplication,
  parameters: { layout: 'fullscreen' },
  args: { onApply: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof JobApplication>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A product designer's job: the facts, then the form. */
export const Default: Story = {};

/** Sending fails: it says so next to the button, and every field and the CV stay. */
export const SendFails: Story = { args: { onApply: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
