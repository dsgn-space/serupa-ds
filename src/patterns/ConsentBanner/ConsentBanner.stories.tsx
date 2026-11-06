import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConsentBanner } from './ConsentBanner';

/* Consent banner (PT13): a cookie banner at the top of the page that never covers it, with a settings section to
   change the answer later. ConsentBanner.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Consent banner',
  component: ConsentBanner,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ConsentBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first visit: the banner asks, with accept and reject side by side and alike. */
export const FirstVisit: Story = {};

/** Answered before: no banner, and the settings show the answer, ready to change. */
export const AlreadyAnswered: Story = { args: { initial: 'accepted' } };
