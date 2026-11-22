import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeedbackSurvey } from './FeedbackSurvey';

/* Feedback survey: a rating, what you came to do, what could be better, your words, and whether we may write back.
   FeedbackSurvey.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Feedback survey',
  component: FeedbackSurvey,
  parameters: { layout: 'fullscreen' },
  args: { onSend: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof FeedbackSurvey>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Only the rating is needed; the email is asked for once you say we may write back. */
export const Default: Story = {};

/** After an order: the h1 names what the survey is about. */
export const AfterAnOrder: Story = { args: { about: 'your order' } };

/** Sending fails: the page says so next to Send, and every answer stays. */
export const SendFails: Story = { args: { onSend: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
