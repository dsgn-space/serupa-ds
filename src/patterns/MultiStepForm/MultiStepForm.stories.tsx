import type { Meta, StoryObj } from '@storybook/react-vite';
import { MultiStepForm, type Application } from './MultiStepForm';

/* Multi-step form: an application for a business account, three steps of questions and a review, then what happens
   next. MultiStepForm.mdx says why each part is there and what stays the app's job. Sending succeeds here. */
const ANSWERS: Partial<Application> = {
  business: 'Kopi Senja', type: 'company', registration: '8120001234567',
  line1: 'Jalan Braga 12', city: 'Bandung', postcode: '40111', country: 'ID',
  name: 'Ani Wijaya', role: 'Owner', email: 'ani@kopisenja.example', phone: '+62 812 3456 7890',
  currency: 'IDR', payments: 'some', cards: 3,
};

const meta = {
  title: 'Patterns/Multi-step form',
  component: MultiStepForm,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MultiStepForm>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first step: the business, its type and its address. */
export const Default: Story = {};

/** The second step, the first one done: the contact person, and the cards posted to the business address unless that's unticked. */
export const ContactPerson: Story = { args: { start: 1, initial: { ...ANSWERS, name: '', role: '', email: '', phone: '' } } };

/** Every answer shown before anything is sent, each part with a way to change it. */
export const CheckAnswers: Story = { args: { start: 3, initial: ANSWERS } };

/** Sending fails: the answers stay, it says nothing was sent, and the button sends again. */
export const SendFails: Story = { args: { failed: true, initial: ANSWERS, onSubmit: () => Promise.reject(new Error('offline')) } };

/** Sent: the reference, where the copy went, and what happens next. */
export const Sent: Story = { args: { sent: true, initial: ANSWERS } };
