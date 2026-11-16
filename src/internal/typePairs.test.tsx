import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render as draw } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { DEFAULT_LABELS } from './labels';
import { SerupaProvider } from './provider';
import { Button } from '../components/Button/Button';
import { CommandPalette } from '../components/CommandPalette/CommandPalette';
import { DateField } from '../components/DateField/DateField';
import { Heading } from '../components/Heading/Heading';
import { Menu, MenuItem } from '../components/Menu/Menu';
import { Prose } from '../components/Prose/Prose';
import { TableActionBar } from '../components/Table/Table';
import { TreeView } from '../components/TreeView/TreeView';

// Run 302: every piece of text takes its size's own line height (text-xs with 16px, text-sm with 20px), not the 24px
// of the page around it, and like parts read alike from one component to the next.
const render = (ui: React.ReactNode) => draw(<SerupaProvider locale="en-US" labels={DEFAULT_LABELS}><div style={{ lineHeight: '24px' }}>{ui}</div></SerupaProvider>);
const byText = (text: string) => [...document.body.querySelectorAll('*')].reverse().find((x) => x.textContent?.trim() === text)!;
const pair = (size: 'xs' | 'sm') => {
  const p = document.createElement('span'); p.style.lineHeight = `var(--text-${size}--line-height)`; document.body.append(p);
  const v = getComputedStyle(p).lineHeight; p.remove(); return v;
};
const lh = (x: Element) => getComputedStyle(x).lineHeight;

describe('type pairs', () => {
  test("CommandPalette's group heading reads as a Menu group's: 12/16, medium, 6px over and 4px under", async () => {
    await render(<CommandPalette defaultOpen commands={[{ id: 'home', label: 'Home', group: 'Pages' }]} />);
    const s = getComputedStyle(byText('Pages'));
    expect([s.lineHeight, s.fontWeight, s.paddingTop, s.paddingBottom]).toEqual([pair('xs'), '500', '6px', '4px']);
  });

  test("a Menu item's shortcut is 12/16", async () => {
    await render(<Menu trigger={<Button>Actions</Button>}><MenuItem shortcut="⌘E">Edit</MenuItem></Menu>);
    await userEvent.click(byText('Actions'));
    await expect.poll(() => byText('⌘E')).toBeTruthy();
    expect(lh(byText('⌘E'))).toBe(pair('xs'));
  });

  test("TreeView's labels, DateField's Day, Month and Year, and TableActionBar's count are 14/20", async () => {
    await render(<>
      <TreeView aria-label="Fruit" items={[{ id: 'a', label: 'Apples' }]} />
      <DateField aria-label="Date" />
      <TableActionBar count={2} />
    </>);
    for (const t of ['Apples', 'Day', 'Month', 'Year', '2 selected']) expect(lh(byText(t)), t).toBe(pair('sm'));
  });

  test("Prose's h6 is Heading level 6's size", async () => {
    await render(<><Prose><h6>Notes</h6></Prose><Heading level={6}>Level six</Heading></>);
    const a = getComputedStyle(byText('Notes')), b = getComputedStyle(byText('Level six'));
    expect([a.fontSize, a.lineHeight]).toEqual([b.fontSize, b.lineHeight]);
  });
});
