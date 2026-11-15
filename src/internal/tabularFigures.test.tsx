import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render as draw } from 'vitest-browser-react';
import { DEFAULT_LABELS } from './labels';
import { SerupaProvider } from './provider';
import { Prose } from '../components/Prose/Prose';
import { toast, Toaster } from '../components/Toast/Toast';
import { TransferList } from '../components/TransferList/TransferList';

// GR424 (audit runs 298 and 299): numbers that change or sit in a column use tabular figures, so they keep their
// width as they change and line up down a column; small text keeps the small text's own line height.
const tabular = (el: Element | null | undefined) => getComputedStyle(el!).fontVariantNumeric;
// The test finds things by their English words and digits, so it renders in English in every locale run.
const render = (ui: React.ReactNode) => draw(<SerupaProvider locale="en-US" labels={DEFAULT_LABELS}>{ui}</SerupaProvider>);
// The innermost element whose whole text is this.
const byText = (text: string) => [...document.body.querySelectorAll('*')].reverse().find((x) => x.textContent?.trim() === text);

describe('tabular figures where numbers change or line up', () => {
  test("a table cell in Prose and TransferList's count", async () => {
    await render(
      <div>
        <Prose><table><tbody><tr><td>1,204</td></tr></tbody></table></Prose>
        <TransferList aria-label="Columns" options={[{ value: 'id', label: 'ID' }, { value: 'email', label: 'Email' }]} defaultValue={['id']} />
      </div>,
    );
    expect(tabular(document.querySelector('td'))).toBe('tabular-nums');
    expect(tabular(byText('(1)'))).toBe('tabular-nums');   // the count beside "Chosen"
  });

  test('TransferList: the side titles take the small text’s line height, not the 24px they would inherit', async () => {
    await render(<div style={{ lineHeight: '24px' }}><TransferList aria-label="Columns" options={[{ value: 'id', label: 'ID' }]} /></div>);
    const title = byText('Available (1)')!;
    const probe = document.createElement('span'); probe.style.lineHeight = 'var(--text-sm--line-height)'; document.body.append(probe);
    expect(getComputedStyle(title).lineHeight).toBe(getComputedStyle(probe).lineHeight);
    probe.remove();
  });

  test('Toast: the "+N more" pill under a stack', async () => {
    await render(<Toaster />);
    React.act(() => { for (let i = 1; i <= 5; i++) toast({ title: `Upload ${i} failed`, duration: 0 }); });
    await expect.poll(() => byText('+2 more')).toBeTruthy();
    expect(tabular(byText('+2 more'))).toBe('tabular-nums');
  });
});
