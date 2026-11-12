import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { Faq, type FaqGroup } from './Faq';

/* FAQ (RU17): questions and answers in groups, as a block an app copies. Faq.mdx says what each part is for.
   The stories put it on a small help page (a skip link, main and an h1). */
const groups: FaqGroup[] = [
  { id: 'account', title: 'Your account', questions: [
    { id: 'change-email', question: 'How do I change my email address?', answer: 'Go to Settings, then Account, and choose Change email. We send a link to the new address; the change takes effect once you open it.' },
    { id: 'two-step', question: 'How do I turn on two-step sign-in?', answer: 'Go to Settings, then Security, and choose Turn on two-step sign-in. You can use an authenticator app or a passkey.', keywords: '2fa mfa authenticator passkey' },
    { id: 'delete-account', question: 'How do I delete my account?', answer: <>
      <p className="m-0">Go to Settings, then Account, and choose Delete account. You have 30 days to change your mind before anything is removed.</p>
      <p className="m-0">Export your projects first if you want to keep them: <Link href="#export">how to export</Link>.</p>
    </>, keywords: 'close remove' },
  ] },
  { id: 'billing', title: 'Billing', questions: [
    { id: 'cancel-plan', question: 'How do I cancel my plan?', answer: 'Go to Settings, then Billing, and choose Cancel plan. It takes two steps, and your plan runs until the end of the period you paid for.', keywords: 'stop subscription' },
    { id: 'refund', question: 'Can I get a refund?', answer: 'Yes, within 14 days of a payment, for any reason. Ask us and we refund it to the card you paid with in 5 to 10 working days.', keywords: 'money back' },
    { id: 'invoices', question: 'Where are my invoices?', answer: 'Every invoice is under Settings, then Billing, then Invoices, as a PDF you can download. We also email each one to the billing contact.', keywords: 'receipt tax' },
    { id: 'currency', question: 'Can I pay in rupiah?', answer: 'Yes. Pick the currency when you choose a plan; prices in rupiah include VAT.', keywords: 'idr currency' },
  ] },
  { id: 'data', title: 'Your data', questions: [
    { id: 'export', question: 'How do I export my projects?', answer: 'Open a project, choose More, then Export. You get a ZIP of its files and a CSV of its tasks.' },
    { id: 'where-stored', question: 'Where is my data stored?', answer: 'In data centres in Jakarta and Singapore, encrypted at rest and in transit.', keywords: 'privacy location server' },
  ] },
];

const contact = <>
  <p className="m-0">Our support team answers within one working day, Monday to Friday.</p>
  <Button variant="secondary" onClick={() => {}}>Contact support</Button>
</>;

function Page({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 outline-none">
    <Heading level={1}>Help</Heading>{children}</main></div>;
}

const meta = {
  title: 'Blocks/FAQ',
  component: Faq,
  parameters: { layout: 'fullscreen' },
  args: { groups, contact },
  render: (args) => <Page><Faq {...args} /></Page>,
} satisfies Meta<typeof Faq>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Groups of questions with a search field, and "Still stuck?" at the end. Find-in-page reaches the closed answers too. */
export const Default: Story = {};

/** One question open: its answer has two paragraphs and a link. */
export const Open: Story = { args: { defaultOpen: ['delete-account'] } };

/** Searching "money": the refund question matches by its keywords, and "1 of 9 questions" is said. */
export const Searching: Story = { args: { defaultQuery: 'money' } };

/** Searching two words marks each one where it is in the questions. */
export const SearchingWords: Story = { args: { defaultQuery: 'account delete' } };

/** Nothing matches: the no-match text points to "Still stuck?", which stays. */
export const NoMatch: Story = { args: { defaultQuery: 'shipping' } };

/** A short FAQ in one group: no group heading, and no search field (six questions or fewer). */
export const Short: Story = { args: { groups: [{ id: 'all', questions: groups[1].questions }] } };
