import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignAgreement } from './SignAgreement';

/* Sign agreement: the agreement in a box of its own, a box to tick, and a signature drawn or typed.
   SignAgreement.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Sign agreement',
  component: SignAgreement,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SignAgreement>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Before signing: the agreement to read, the box to tick and the signature box. */
export const Default: Story = {};

/** The signature couldn't be sent: it says so, and what was filled in stays. */
export const SignFails: Story = { args: { onSign: () => Promise.reject(new Error('offline')) } };

/** Offline: the agreement can still be read, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
