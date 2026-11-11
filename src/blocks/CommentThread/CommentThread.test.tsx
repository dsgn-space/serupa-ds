import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Toaster } from '../../components/Toast/Toast';
import { CommentThread, type ThreadComment } from './CommentThread';

// Text read out by the shared polite announcer, wherever it lives on the page.
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const ago = (minutes: number) => Date.now() - minutes * 60_000;
const start: ThreadComment[] = [
  { id: 'a', author: { name: 'Ana Putri' }, body: 'Can we make the total bigger?', date: ago(30) },
  { id: 'b', author: { name: 'You' }, body: 'Yes, I will try 20px.', date: ago(20), mine: true },
  { id: 'c', author: { name: 'Budi Santoso' }, body: 'Looks good.', date: ago(10) },
];

function Harness({ onDelete = () => {} }: { onDelete?: (id: string) => void }) {
  const [comments, setComments] = React.useState(start);
  return <>
    <CommentThread comments={comments} maxLength={40} onDelete={onDelete}
      onReply={(body) => Promise.resolve().then(() => setComments((c) => [...c, { id: String(c.length + 1), author: { name: 'You' }, body, date: Date.now(), mine: true }]))}
      onEdit={(id, body) => setComments((c) => c.map((x) => (x.id === id ? { ...x, body, edited: true } : x)))} />
    <Toaster />
  </>;
}
const mine = () => page.getByRole('article', { name: /^You/ }).first();

// Comment thread (BL8): a named region with the comments as named articles, a labelled reply box with a count,
// and edit and delete for your own that keep focus in place, with Undo.
describe('Blocks/Comment thread', () => {
  test('the comments are a list of articles named by who and when; only your own have Edit and Delete', async () => {
    await render(<Harness />);
    const thread = page.getByRole('region', { name: 'Comments' });
    await expect.element(thread).toBeVisible();
    expect(thread.getByRole('article').elements()).toHaveLength(3);
    expect(page.getByRole('article', { name: /^Ana Putri/ }).getByRole('button').elements()).toHaveLength(0);
    await expect.element(mine().getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect.element(mine().getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('an empty reply says what to do next to the box; a reply posts, clears the box and is said', async () => {
    await render(<Harness />);
    const box = page.getByRole('textbox', { name: 'Reply' });
    await userEvent.click(page.getByRole('button', { name: 'Post reply' }));
    await expect.element(box).toHaveAccessibleDescription(/Write a reply first/);
    await expect.element(box).toHaveFocus();
    await userEvent.fill(box, 'Shipped it.');
    await userEvent.click(page.getByRole('button', { name: 'Post reply' }));
    await expect.poll(() => page.getByRole('article').elements().length).toBe(4);
    await expect.element(box).toHaveValue('');
    await expect.poll(said).toContain('Reply posted');
  });

  test('the reply box shows the limit and a count, and stops at the limit', async () => {
    await render(<Harness />);
    const box = page.getByRole('textbox', { name: 'Reply' });
    await expect.element(box).toHaveAccessibleDescription(/Up to 40 characters/);
    await userEvent.fill(box, 'x'.repeat(60));
    await expect.poll(() => (box.element() as HTMLTextAreaElement).value.length).toBe(40);
  });

  test('Edit puts focus in the comment’s box; Save brings it back to Edit and says it was saved', async () => {
    await render(<Harness />);
    await userEvent.click(mine().getByRole('button', { name: 'Edit' }));
    const box = page.getByRole('textbox', { name: 'Edit comment' });
    await expect.element(box).toHaveFocus();
    await userEvent.fill(box, 'Yes, 24px.');
    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    await expect.poll(() => mine().element().textContent).toContain('Yes, 24px.');
    expect(mine().element().textContent).toContain('edited');
    await expect.element(mine().getByRole('button', { name: 'Edit' })).toHaveFocus();
    await expect.poll(said).toContain('Comment saved');
  });

  test('Escape cancels an edit and brings focus back to Edit', async () => {
    await render(<Harness />);
    await userEvent.click(mine().getByRole('button', { name: 'Edit' }));
    await userEvent.keyboard('{Escape}');
    await expect.element(mine().getByRole('button', { name: 'Edit' })).toHaveFocus();
    expect(mine().element().textContent).toContain('Yes, I will try 20px.');
  });

  test('the Escape that cancels an input method\'s composition keeps the edit open (GR299)', async () => {
    await render(<Harness />);
    await userEvent.click(mine().getByRole('button', { name: 'Edit' }));
    // The edit box takes focus once it has drawn, which in WebKit can be after the click returns.
    await expect.poll(() => document.activeElement?.getAttribute('role') === 'textbox' || document.activeElement instanceof HTMLTextAreaElement).toBe(true);
    const box = document.activeElement as HTMLElement;
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 100));
    expect([box.isConnected, document.activeElement === box]).toEqual([true, true]);
  });

  test('Delete moves focus to the next comment, and Undo brings it back focused without deleting', async () => {
    const onDelete = vi.fn();
    await render(<Harness onDelete={onDelete} />);
    await userEvent.click(mine().getByRole('button', { name: 'Delete' }));
    await expect.poll(() => page.getByRole('article').elements().length).toBe(2);
    await expect.element(page.getByRole('article', { name: /^Budi Santoso/ })).toHaveFocus();
    await userEvent.click(page.getByRole('button', { name: 'Undo' }));
    await expect.poll(() => page.getByRole('article').elements().length).toBe(3);
    await expect.element(mine()).toHaveFocus();
    expect(onDelete).not.toHaveBeenCalled();
  });

  test('Cancel ends an edit without saving and brings focus back to Edit', async () => {
    await render(<Harness />);
    await userEvent.click(mine().getByRole('button', { name: 'Edit' }));
    await userEvent.fill(page.getByRole('textbox', { name: 'Edit comment' }), 'Changed my mind');
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect.element(mine().getByRole('button', { name: 'Edit' })).toHaveFocus();
    expect(mine().element().textContent).toContain('Yes, I will try 20px.');
  });

  test('deleting the last comment moves focus to the heading, and the delete is done once the toast goes without Undo', async () => {
    const onDelete = vi.fn();
    await render(<>
      <CommentThread comments={[start[1]]} onReply={() => {}} onDelete={onDelete} />
      <Toaster duration={300} />
    </>);
    await userEvent.click(page.getByRole('button', { name: 'Delete' }));
    await expect.element(page.getByRole('heading', { name: 'Comments' })).toHaveFocus();
    await expect.element(page.getByText('No comments yet. Start the conversation.')).toBeVisible();
    await expect.poll(() => onDelete.mock.calls).toEqual([['b']]);
  });

  test('a reply that fails keeps its words in the box and ends the loading state', async () => {
    let fail = () => {};
    const onReply = vi.fn(() => new Promise<void>((_, no) => { fail = () => no(new Error('offline')); }));
    const view = await render(<CommentThread comments={start} onReply={onReply} />);
    await userEvent.fill(page.getByRole('textbox', { name: 'Reply' }), 'Still here');
    await userEvent.click(page.getByRole('button', { name: 'Post reply' }));
    await expect.element(page.getByRole('button', { name: 'Post reply' })).toHaveAttribute('aria-busy', 'true');
    fail();
    await expect.poll(() => (page.getByRole('button', { name: 'Post reply' }).element() as HTMLButtonElement).getAttribute('aria-busy')).not.toBe('true');
    await expect.element(page.getByRole('textbox', { name: 'Reply' })).toHaveValue('Still here');
    await expect.element(view.locator.getByText('Couldn’t post the reply. Try again.')).toBeVisible();
    await expect.poll(said).toContain('Couldn’t post the reply');
    expect(said()).not.toContain('Reply posted');
  });

  test('saving an emptied comment says what to do on the box and keeps focus there (GR143)', async () => {
    const onEdit = vi.fn();
    await render(<CommentThread comments={start} onReply={() => {}} onEdit={onEdit} />);
    await userEvent.click(mine().getByRole('button', { name: 'Edit' }));
    const box = page.getByRole('textbox', { name: 'Edit comment' });
    await userEvent.fill(box, '   ');
    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    await expect.element(box).toHaveAttribute('aria-invalid', 'true');
    await expect.element(box).toHaveAccessibleDescription(/Write something, or delete the comment\./);
    await expect.element(box).toHaveFocus();
    expect(onEdit).not.toHaveBeenCalled();
    await userEvent.fill(box, 'Back again');
    await expect.element(box).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('a save that fails keeps the box open with its words, and says so once (GR144)', async () => {
    const view = await render(<CommentThread comments={start} onReply={() => {}} onEdit={() => Promise.reject(new Error('offline'))} />);
    await userEvent.click(mine().getByRole('button', { name: 'Edit' }));
    await userEvent.fill(page.getByRole('textbox', { name: 'Edit comment' }), 'Yes, 24px.');
    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    await expect.element(view.locator.getByText('Couldn’t save the comment. Try again.')).toBeVisible();
    await expect.poll(said).toContain('Couldn’t save the comment');
    await expect.element(page.getByRole('textbox', { name: 'Edit comment' })).toHaveValue('Yes, 24px.');
    expect(said()).not.toContain('Comment saved');
  });

  test('Save is busy until the save settles, so a double click sends the edit once', async () => {
    let done = () => {};
    const onEdit = vi.fn(() => new Promise<void>((ok) => { done = ok; }));
    await render(<CommentThread comments={start} onReply={() => {}} onEdit={onEdit} />);
    await userEvent.click(mine().getByRole('button', { name: 'Edit' }));
    await userEvent.fill(page.getByRole('textbox', { name: 'Edit comment' }), 'Yes, 24px.');
    const form = (page.getByRole('textbox', { name: 'Edit comment' }).element() as HTMLTextAreaElement).form!;
    const save = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    save.click();
    await expect.poll(() => save.getAttribute('aria-busy')).toBe('true');
    save.click();
    form.requestSubmit();
    expect(onEdit).toHaveBeenCalledTimes(1);
    done();
    await expect.poll(said).toContain('Comment saved');
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test('every word can be given in the page language', async () => {
    await render(<CommentThread comments={[]} onReply={() => {}} labels={{ title: 'Komentar', noComments: 'Belum ada komentar.', reply: 'Balas', replyHint: (n) => `Paling banyak ${n} karakter.`, post: 'Kirim balasan' }} />);
    await expect.element(page.getByRole('region', { name: 'Komentar' })).toBeVisible();
    await expect.element(page.getByText('Belum ada komentar.')).toBeVisible();
    await expect.element(page.getByRole('textbox', { name: 'Balas' })).toHaveAccessibleDescription(/Paling banyak 1000 karakter/);
    await expect.element(page.getByRole('button', { name: 'Kirim balasan' })).toBeVisible();
  });

  test('the comments keep role="list", since Safari stops calling a list without bullets a list (GR151)', async () => {
    await render(<CommentThread comments={start} onReply={() => {}} />);
    const bare = [...document.querySelectorAll('ul, ol')].filter((l) => getComputedStyle(l).listStyleType === 'none' && !l.closest('nav'));
    expect(bare.length).toBeGreaterThan(0);
    expect(bare.map((l) => l.getAttribute('role'))).toEqual(bare.map(() => 'list'));
  });
});
