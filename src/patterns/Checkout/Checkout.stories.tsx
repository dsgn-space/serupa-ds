import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkout, type CheckoutDetails, type PaymentMethod } from './Checkout';

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

/** The order wasn't placed (the card was declined, or the network failed): the review step stays, with every answer,
    and says nothing was charged and what to try. Here `onPlaceOrder` rejects again on another try. */
export const OrderFails: Story = { args: { initial: filled, failed: true, onPlaceOrder: () => Promise.reject(new Error('declined')) } };

/** The confirmation: the order is placed, and it says where the receipt went and what happens next. */
export const Placed: Story = { args: { initial: filled, placed: true } };

const noCard: Partial<CheckoutDetails> = { ...filled, cardNumber: '', cardName: '', cardExpiry: '', cardCode: '' };
const saved: PaymentMethod[] = [
  {
    kind: 'card', id: 'card', label: 'Card', description: 'Visa, Mastercard or American Express',
    savedCards: [{ id: 'visa', brand: 'Visa', last4: '4242', expiry: '08/39' }, { id: 'old', brand: 'Mastercard', last4: '5100', expiry: '01/20' }],
  },
  { kind: 'wallet', id: 'google-pay', label: 'Google Pay', description: 'Confirm on your phone' },
  { kind: 'qr', id: 'qris', label: 'QRIS', unavailable: 'Not for orders over $5,000' },
];

/** Paying by bank transfer: pick the bank here, and the virtual account's number comes once the order is placed. */
export const BankTransfer: Story = { args: { initial: { ...noCard, method: 'bank', bank: 'bca' } } };

/** An e-wallet: which one, and the phone number its app asks to approve on. */
export const EWallet: Story = { args: { initial: { ...noCard, method: 'ewallet', ewallet: 'ovo', walletPhone: '0812 3456 7890' } } };

/** A returning customer's saved cards come first, the expired one out of reach, with "A new card" after them. The
    methods are the app's list: here a card, Google Pay, and QRIS, which this order is too large for. */
export const SavedCards: Story = { args: { initial: noCard, methods: saved } };

/** After the order, for a bank transfer: the account number and the amount, each with a copy button, and the time
    left to pay. */
export const AwaitingBankTransfer: Story = {
  args: { initial: { ...noCard, method: 'bank', bank: 'bca' }, placed: true, instructions: { accountNumber: '8808 1234 5678 9012', secondsLeft: 86340 } },
};

/** After the order, for QRIS: the code to scan (from the payment provider; a stand-in here) and the time it works for. */
export const AwaitingQris: Story = { args: { initial: { ...noCard, method: 'qris' }, placed: true, instructions: { secondsLeft: 900 } } };

/** A promo code applied: it shows in the summary with Remove, and a discount line comes before the total. Try
    WELCOME10 in the Details story. */
export const PromoApplied: Story = { args: { initial: filled, startAtReview: true, promo: { code: 'WELCOME10', discount: 615, label: '10% off' } } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
