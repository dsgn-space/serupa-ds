import type { Meta, StoryObj } from '@storybook/react-vite';
import { Onboarding } from './Onboarding';

/* Onboarding / first run (PT11): the first page a new account sees, with a checklist of setup steps. Onboarding.mdx
   says why each part is there and what stays the app's job. The step links go nowhere here. */
const meta = {
  title: 'Patterns/Onboarding',
  component: Onboarding,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Onboarding>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first visit: nothing done yet, every step's link is the main action. */
export const FirstVisit: Story = {};

/** Coming back halfway: the done steps say "Done" and their links step back to secondary. */
export const Halfway: Story = { args: { initial: { done: ['profile', 'team'] } } };

/** Every step done: "You’re all set" and the way on to the dashboard. */
export const AllDone: Story = { args: { initial: { done: ['profile', 'team', 'project', 'notifications'] } } };

/** Folded away: one line with the count, and a button to show the checklist again. */
export const Hidden: Story = { args: { initial: { done: ['profile'], hidden: true } } };
