import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Faq, type FaqGroup } from './Faq';

const groups: FaqGroup[] = [
  { id: 'account', title: 'Your account', questions: [
    { id: 'change-email', question: 'How do I change my email address?', answer: 'Go to Settings, then Account.' },
    { id: 'delete-account', question: 'How do I delete my account?', answer: <p>You have <strong>30 days</strong> to change your mind.</p>, keywords: 'close remove' },
  ] },
  { id: 'billing', title: 'Billing', questions: [
    { id: 'cancel-plan', question: 'How do I cancel my plan?', answer: 'Go to Settings, then Billing, and choose Cancel plan.' },
    { id: 'refund', question: 'Can I get a refund?', answer: 'Yes, within 14 days of a payment.', keywords: 'money back' },
    { id: 'invoices', question: 'Where are my invoices?', answer: 'Under Settings, then Billing, then Invoices.' },
    { id: 'currency', question: 'Can I pay in rupiah?', answer: 'Yes, prices in rupiah include VAT.' },
    { id: 'tax', question: 'Do prices include tax?', answer: 'Yes, in every currency.' },
  ] },
];
const contact = <><p>We answer within one working day.</p><button type="button">Contact support</button></>;
const question = (name: string) => page.getByRole('button', { name });
// The count under the search (the page's shared announcer is a status too).
const count = () => document.querySelector('section p[role="status"]')?.textContent;
const answer = (id: string) => document.querySelector(`[id="${id}"] [hidden]`) as HTMLElement;

afterEach(() => { history.replaceState(null, '', location.pathname + location.search); });

// FAQ (RU17): a region named by its heading, groups and questions as headings, find-in-page reaching closed
// answers, a search that filters and says how many match, a link that opens a question, and "Still stuck?".
describe('Blocks/FAQ', () => {
  test('a named region; each group and each question is a heading at the next level; answers start closed', async () => {
    await render(<Faq groups={groups} contact={contact} />);
    await expect.element(page.getByRole('region', { name: 'Frequently asked questions' })).toBeVisible();
    await expect.element(page.getByRole('heading', { level: 3, name: 'Billing' })).toBeVisible();
    expect(page.getByRole('heading', { level: 4 }).elements()).toHaveLength(7);
    await expect.element(question('How do I cancel my plan?')).toHaveAttribute('aria-expanded', 'false');
    expect(answer('cancel-plan').getAttribute('hidden')).toBe('until-found');   // find-in-page still reaches it
  });

  test('questions open on their own: opening one leaves the others as they are', async () => {
    await render(<Faq groups={groups} contact={contact} />);
    await question('How do I cancel my plan?').click();
    await question('Can I get a refund?').click();
    await expect.element(question('How do I cancel my plan?')).toHaveAttribute('aria-expanded', 'true');
    await expect.element(question('Can I get a refund?')).toHaveAttribute('aria-expanded', 'true');
    await expect.element(page.getByText('Yes, within 14 days of a payment.')).toBeVisible();
  });

  test('the search filters by every word, in questions, plain answers and keywords, ignoring case; the count is a status', async () => {
    await render(<Faq groups={groups} contact={contact} />);
    const search = page.getByRole('searchbox', { name: 'Search the questions' });
    await expect.poll(count).toBe('');
    await userEvent.type(search, 'MONEY');
    await expect.poll(count).toBe('1 of 7 questions');
    expect(page.getByRole('heading', { level: 4 }).elements().map((h) => h.textContent)).toEqual(['Can I get a refund?']);
    expect(page.getByRole('heading', { name: 'Your account' }).elements()).toHaveLength(0);   // a group with no match goes
    await userEvent.clear(search);
    await userEvent.type(search, 'settings billing');
    await expect.poll(count).toBe('2 of 7 questions');
    await userEvent.clear(search);
    await userEvent.type(search, 'delete account');
    await expect.poll(count).toBe('1 of 7 questions');
    expect([...document.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['delete', 'account']);
  });

  test('nothing matches: it says so and points to "Still stuck?", which stays', async () => {
    await render(<Faq groups={groups} contact={contact} defaultQuery="shipping" />);
    await expect.element(page.getByText('No questions match “shipping”. Try other words, or ask us.')).toBeVisible();
    await expect.poll(count).toBe('0 of 7 questions');
    await expect.element(page.getByRole('region', { name: 'Still stuck?' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Contact support' })).toBeVisible();
  });

  test('a link to #question-id opens that question and moves focus to it, on load and on a later hash change', async () => {
    history.replaceState(null, '', '#refund');
    await render(<Faq groups={groups} contact={contact} defaultQuery="currency" />);
    await expect.element(question('Can I get a refund?')).toHaveAttribute('aria-expanded', 'true');
    await expect.element(question('Can I get a refund?')).toHaveFocus();
    expect(count()).toBe('');   // the search was cleared, so the question shows
    location.hash = 'invoices';
    await expect.element(question('Where are my invoices?')).toHaveAttribute('aria-expanded', 'true');
    await expect.element(question('Where are my invoices?')).toHaveFocus();
    await expect.element(question('Can I get a refund?')).toHaveAttribute('aria-expanded', 'true');
    location.hash = 'not-a-question';
    await expect.element(question('Where are my invoices?')).toHaveFocus();
  });

  test('one group without a title, six questions or fewer: no group heading, no search, questions one level down', async () => {
    await render(<Faq groups={[{ id: 'all', questions: groups[0]!.questions }]} headingLevel={3} defaultOpen={['delete-account']} />);
    await expect.element(page.getByRole('heading', { level: 3, name: 'Frequently asked questions' })).toBeVisible();
    expect(page.getByRole('heading', { level: 4 }).elements()).toHaveLength(2);
    expect(page.getByRole('searchbox').elements()).toHaveLength(0);
    expect(page.getByRole('region', { name: 'Still stuck?' }).elements()).toHaveLength(0);
    await expect.element(page.getByText('30 days')).toBeVisible();
  });

  test('labels: every word can be another language', async () => {
    await render(<Faq groups={groups} searchable defaultQuery="xyz" contact={contact}
      labels={{ title: 'Pertanyaan umum', search: 'Cari pertanyaan', results: (n, t) => `${n} dari ${t} pertanyaan`, noMatch: (q) => `Tidak ada yang cocok dengan “${q}”.`, stuck: 'Masih bingung?' }} />);
    await expect.element(page.getByRole('region', { name: 'Pertanyaan umum' })).toBeVisible();
    await expect.element(page.getByRole('searchbox', { name: 'Cari pertanyaan' })).toBeVisible();
    await expect.poll(count).toBe('0 dari 7 pertanyaan');
    await expect.element(page.getByText('Tidak ada yang cocok dengan “xyz”.')).toBeVisible();
    await expect.element(page.getByRole('heading', { name: 'Masih bingung?' })).toBeVisible();
  });
});
