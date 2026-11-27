import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { color } from '../../tools/test/vitest/helpers';
import { AddressBook } from '../patterns/AddressBook/AddressBook';
import { Agenda } from '../patterns/Agenda/Agenda';
import { Approvals } from '../patterns/Approvals/Approvals';
import { OrderHistory } from '../patterns/OrderHistory/OrderHistory';
import { SavedItems } from '../patterns/SavedItems/SavedItems';
import { StatusPage } from '../patterns/StatusPage/StatusPage';
import { StoreLocator } from '../patterns/StoreLocator/StoreLocator';

// Build a page says which background a page takes: bg-surface-sunken behind content built from Cards or panels,
// bg-surface for a page you read or fill in. Its muted-pages comment lists the patterns on the muted page; every other
// pattern's page is plain. Before, 25 of 74 were muted with no rule (SignIn and Checkout muted, StatusPage plain).
const guide = Object.values(import.meta.glob<string>('../../docs/BuildAPage.mdx', { eager: true, query: '?raw', import: 'default' }))[0] ?? '';
const sources = import.meta.glob<string>('../patterns/*/*.tsx', { eager: true, query: '?raw', import: 'default' });
const listed = (mdx: string) => (/\{\/\*\s*muted-pages:\s*([\s\S]*?)\s*\*\/\}/.exec(mdx)?.[1] ?? '').split(/,\s*/).map((w) => w.trim()).filter(Boolean).sort();
const pages = (files: Record<string, string>) => {
  const out: Record<string, string> = {};
  for (const [file, src] of Object.entries(files)) {
    if (/\.(test|stories)\.tsx$/.test(file)) continue;
    const m = /className="min-h-screen (bg-surface(?:-sunken)?)\b/.exec(src);
    // A page on AppShell takes its background prop: muted with background="muted", plain without.
    const shell = /<AppShell\b([^>]*?)>/.exec(src);
    if (m) out[file.split('/')[2]!] = m[1]!;
    else if (shell) out[file.split('/')[2]!] = /background="muted"/.test(shell[1]!) ? 'bg-surface-sunken' : 'bg-surface';
  }
  return out;
};

describe('Page background', () => {
  test('the patterns on bg-surface-sunken are exactly the ones Build a page lists, and the rest are bg-surface', () => {
    const bg = pages(sources);
    expect(Object.keys(bg).length).toBeGreaterThan(60);
    expect(Object.entries(bg).filter(([, v]) => v === 'bg-surface-sunken').map(([k]) => k).sort()).toEqual(listed(guide));
  });

  test('the check reads the list and finds a page on the wrong side', () => {
    expect(listed('{/* muted-pages: Billing, Dashboard */}')).toEqual(['Billing', 'Dashboard']);
    const bg = pages({ '../patterns/SignIn/SignIn.tsx': '<div className="min-h-screen bg-surface-sunken text-text">', '../patterns/SignIn/SignIn.test.tsx': 'min-h-screen bg-surface',
      '../patterns/Inbox/Inbox.tsx': '<AppShell background="muted" header={x}>', '../patterns/Form/Form.tsx': '<AppShell>' });
    expect(bg).toEqual({ SignIn: 'bg-surface-sunken', Inbox: 'bg-surface-sunken', Form: 'bg-surface' });
  });
  test('the pages built from Cards draw it: the muted page under a surface header, so each Card stands off the page', async () => {
    const pages: [string, React.ReactElement][] = [['AddressBook', <AddressBook />], ['Agenda', <Agenda />], ['Approvals', <Approvals />],
      ['OrderHistory', <OrderHistory />], ['SavedItems', <SavedItems />], ['StatusPage', <StatusPage />], ['StoreLocator', <StoreLocator />]];
    const seen: string[] = [];
    for (const [name, el] of pages) {
      const screen = await render(el);
      const header = document.querySelector('header')!, root = header.parentElement!;
      seen.push(`${name} ${getComputedStyle(root).backgroundColor === color('var(--surface-sunken)')} ${getComputedStyle(header).backgroundColor === color('var(--surface)')}`);
      await screen.unmount();
    }
    expect(seen).toEqual(pages.map(([name]) => `${name} true true`));
  });
});
