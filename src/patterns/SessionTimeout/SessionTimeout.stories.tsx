import type { Meta, StoryObj } from '@storybook/react-vite';
import { SessionTimeout } from './SessionTimeout';

/* Session time-out warning (PT14): a page with a form, a warning before the session ends, and a signed-out page that
   keeps what was typed. SessionTimeout.mdx says why each part is there and what stays the app's job. The stories
   use short times so the warning shows soon. */
const meta = {
  title: 'Patterns/Session time-out',
  component: SessionTimeout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SessionTimeout>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Twenty minutes, with the warning two minutes before the end: the page as it usually is. */
export const Default: Story = {};

/** A three-minute session that warns at once, so the warning can be tried. Its countdown moves, so it has no screenshot. */
export const Warning: Story = { args: { duration: 180, warnBefore: 179 }, tags: ['!visual'] };
