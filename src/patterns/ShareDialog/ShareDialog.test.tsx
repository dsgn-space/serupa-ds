import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ShareDialog, shareProblem, sharedWith } from './ShareDialog';
import { SerupaProvider } from '../../internal/provider';
const latin = (t: string | null | undefined) => (t ?? '').replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660));
// A name with its digits in Latin or Arabic-Indic, for a role query that runs in every locale.
const digits = (s: string) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\d/g, (d) => `[${d}${String.fromCharCode(0x660 + Number(d))}]`)}$`);

const said = () => latin([...document.querySelectorAll('[aria-live]')].map((e) => e.textContent || '').join(' '));
const active = () => document.activeElement as HTMLElement;

// Share dialog: who a document is shared with shows beside Share; in the dialog, pickers named per person, a removal
// with Undo in its row that is for good on close, the link's setting in whole phrases, and an add form that names problems.
describe('Patterns/Share dialog', () => {
  test('problems with the addresses are named, and the count is in words', () => {
    expect(shareProblem([], [])).toBe('Enter an email address.');
    expect(shareProblem(['a@x.com', 'nope'], [])).toBe('This isn’t an email address: nope.');
    expect(shareProblem(['no', 'pe@'], [])).toBe('These aren’t email addresses: no, pe@.');
    expect(shareProblem(['a@x.com'], ['a@x.com'])).toBe('Already has access: a@x.com.');
    expect(shareProblem(['a@x.com'], [])).toBeNull();
    expect([sharedWith(0), sharedWith(1), sharedWith(2)]).toEqual(['Not shared', 'Shared with 1 person', 'Shared with 2 people']);
  });

  test('the page says who it is shared with beside Share, and Share opens the dialog on Add people', async () => {
    const screen = await render(<ShareDialog nativeShare={null} />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Q3 plan']);
    await expect.element(screen.getByText(digits('Shared with 2 people · Only people added can open'))).toBeVisible();
    await screen.getByRole('button', { name: 'Share' }).click();
    await expect.element(screen.getByRole('dialog', { name: digits('Share “Q3 plan”') })).toBeVisible();
    await expect.poll(() => active().id).toBe('share-emails');
    expect(screen.getByRole('combobox').elements().map((e) => e.getAttribute('aria-label') ?? e.id))
      .toEqual(['Access for the people you add', 'Access for Budi Santoso', 'Access for Chen Wei', 'share-link']);
    expect(screen.getByRole('button', { name: 'Remove Ana Lima' }).elements()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Share via…' }).elements()).toHaveLength(0);
  });

  test('a changed access is stored and said', async () => {
    const onAccessChange = vi.fn();
    const screen = await render(<ShareDialog defaultOpen nativeShare={null} onAccessChange={onAccessChange} />);
    await screen.getByRole('combobox', { name: 'Access for Budi Santoso' }).selectOptions('view');
    expect(onAccessChange).toHaveBeenCalledWith('u2', 'view');
    await expect.poll(said).toContain('Budi Santoso can view');
  });

  test('Remove leaves Undo in the row with focus; Undo brings the person back; closing makes a removal final', async () => {
    const onRemove = vi.fn();
    const screen = await render(<ShareDialog defaultOpen nativeShare={null} onRemove={onRemove} />);
    await screen.getByRole('button', { name: 'Remove Budi Santoso' }).click();
    await expect.poll(said).toContain('Removed Budi Santoso');
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Undo removing Budi Santoso');
    expect(onRemove).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect.poll(said).toContain('Budi Santoso has access again');
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Remove Budi Santoso');

    await screen.getByRole('button', { name: 'Remove Chen Wei' }).click();
    await screen.getByRole('button', { name: 'Done' }).click();
    expect(onRemove.mock.calls).toEqual([['u3']]);
    await expect.element(screen.getByText('Shared with 1 person · Only people added can open')).toBeVisible();
  });

  test('the link’s setting is whole phrases, stored, said, and shown on the page', async () => {
    const onLinkAccessChange = vi.fn();
    const screen = await render(<ShareDialog defaultOpen nativeShare={null} onLinkAccessChange={onLinkAccessChange} />);
    const link = screen.getByRole('combobox', { name: 'Link' });
    expect([...(link.element() as HTMLSelectElement).options].map((o) => o.text))
      .toEqual(['Only people added can open', 'Anyone with the link can view', 'Anyone with the link can edit']);
    await expect.element(screen.getByText('The link opens only for the people above.')).toBeVisible();
    await link.selectOptions('view');
    expect(onLinkAccessChange).toHaveBeenCalledWith('view');
    await expect.poll(said).toContain('Anyone with the link can view');
    await expect.element(screen.getByText('Anyone who gets the link can open it, without signing in.')).toBeVisible();
  });

  test('adding people names a bad address and keeps it typed; good ones join the list with the chosen access', async () => {
    const onInvite = vi.fn();
    const screen = await render(<ShareDialog defaultOpen nativeShare={null} onInvite={onInvite} />);
    const field = screen.getByRole('textbox', { name: 'Add people' });
    await field.fill('nope');
    await screen.getByRole('button', { name: 'Add' }).click();
    await expect.element(screen.getByText('This isn’t an email address: nope.').first()).toBeVisible();
    expect((field.element() as HTMLInputElement).value).toBe('nope');
    await expect.poll(() => active().id).toBe('share-emails');
    expect(onInvite).not.toHaveBeenCalled();

    await field.fill('budi@example.com');
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText('Already has access: budi@example.com.').first()).toBeVisible();

    await field.fill('eko@example.com, fitri@example.com');
    await screen.getByRole('combobox', { name: 'Access for the people you add' }).selectOptions('edit');
    await screen.getByRole('button', { name: 'Add' }).click();
    await expect.poll(said).toContain('Added 2 people');
    expect(onInvite).toHaveBeenCalledWith(['eko@example.com', 'fitri@example.com'], 'edit');
    expect((screen.getByRole('combobox', { name: 'Access for eko@example.com' }).element() as HTMLSelectElement).value).toBe('edit');
    expect((field.element() as HTMLInputElement).value).toBe('');
  });

  test('an invite that fails says so and keeps what was typed', async () => {
    const screen = await render(<ShareDialog defaultOpen nativeShare={null} onInvite={() => Promise.reject(new Error('offline'))} />);
    const field = screen.getByRole('textbox', { name: 'Add people' });
    await field.fill('eko@example.com');
    await screen.getByRole('button', { name: 'Add' }).click();
    await expect.element(screen.getByText('Couldn’t add them. Try again.')).toBeVisible();
    expect((field.element() as HTMLInputElement).value).toBe('eko@example.com');
  });

  test('Share via… shows where there is a share sheet, and hands it the name and the link', async () => {
    const nativeShare = vi.fn(() => Promise.reject(new Error('AbortError')));
    const screen = await render(<ShareDialog defaultOpen nativeShare={nativeShare} url="https://acme.example/d/1" />);
    await screen.getByRole('button', { name: 'Share via…' }).click();
    expect(nativeShare).toHaveBeenCalledWith({ title: 'Q3 plan', url: 'https://acme.example/d/1' });
    await expect.element(screen.getByRole('button', { name: 'Copy link' })).toBeVisible();
    // The footer's buttons are one height: Copy link, Share via… and Done.
    const h = (name: string) => Math.round(screen.getByRole('button', { name }).element().getBoundingClientRect().height);
    expect(new Set(['Copy link', 'Share via…', 'Done'].map(h)).size).toBe(1);
  });

  test('with no nativeShare given, the browser’s own share sheet is used when it has one', async () => {
    const share = vi.fn(() => Promise.resolve());
    const had = Object.getOwnPropertyDescriptor(navigator, 'share');
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    try {
      const screen = await render(<ShareDialog defaultOpen />);
      await screen.getByRole('button', { name: 'Share via…' }).click();
      expect(share).toHaveBeenCalledWith({ title: 'Q3 plan', url: 'https://acme.example/d/q3-plan' });
    } finally {
      if (had) Object.defineProperty(navigator, 'share', had); else delete (navigator as { share?: unknown }).share;
    }
  });

  test('counts follow the locale’s digits', async () => {
    const bodyText = () => document.body.textContent ?? '';
    expect(sharedWith(3, 'ar-EG')).toBe('Shared with ٣ people');
    await render(<SerupaProvider locale="ar-EG"><ShareDialog /></SerupaProvider>);
    expect(bodyText()).toContain('Shared with ٢ people');
  });
});

// How many lines an element's text takes on screen.
const linesOf = (el: Element) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; };

describe('ShareDialog on a phone', () => {
  test('on a phone, each person’s email stays on one line: the access and Remove go under it', async () => {
    await page.viewport(360, 720);
    try {
      await render(<ShareDialog defaultOpen nativeShare={null} />);
      for (const email of ['budi@example.com', 'chen@example.com']) { const e = [...document.querySelectorAll('li span')].find((s) => s.textContent === email)!; expect(linesOf(e), email).toBe(1); }
    } finally { await page.viewport(900, 700); }
  });
});
