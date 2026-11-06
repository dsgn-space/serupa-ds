import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkout, type CheckoutDetails } from './Checkout';

/* Checkout / payment details (PT12): delivery address, delivery, a tip and card details, the order summary, a review
   step and a confirmation. Checkout.mdx says why each part is there and what stays the app's job. Placing the order
   succeeds here, without charging anything. */
const filled: Partial<CheckoutDetails> = {
  name: 'Ada Lovelace', line1: '12 St James’s Square', city: 'London', postcode: 'SW1Y 4JH', country: 'GB',
  email: 'ada@example.com', delivery: 'express', tip: 250,
  cardNumber: '4242 4242 4242 4242', cardName: 'A Lovelace', cardExpiry: '08/27', cardCode: '123',
};

const meta = {
  title: 'Patterns/Checkout',
  component: Checkout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Checkout>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first visit: every field empty, with its autocomplete token so the browser can fill it. */
export const Details: Story = {};

/** A saved address and card already filled in: "Review your order" goes straight to the review. */
export const Prefilled: Story = { args: { initial: filled } };

/** The review step: everything before it's placed, each part with a way back to change it. */
export const Review: Story = { args: { initial: filled, startAtReview: true } };
