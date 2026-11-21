import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, test } from 'vitest';
import { Button } from '../components/Button/Button';
import { HoverCard } from '../components/HoverCard/HoverCard';
import { Menu, MenuGroup, MenuItem, MenuSeparator, MenuSub } from '../components/Menu/Menu';
import { Popover } from '../components/Popover/Popover';
import { Tooltip } from '../components/Tooltip/Tooltip';

// A tooltip on a word, a hover card on a name, a popover or a menu on a button: each often sits in a line of text. A
// <div> next to the trigger ends the paragraph when the browser reads the server's HTML, so the rest of the line fell
// out of it and hydration didn't match.
const ui = (
  <div>
    <p id="tip">Fees apply <Tooltip content="Up to 2% of the amount"><a href="#fees">on transfers</a></Tooltip> abroad.</p>
    <p id="card">Ask <HoverCard trigger={<a href="#dewi">Dewi</a>}>Owns the checkout screens.</HoverCard> first.</p>
    <p id="pop">Totals are rounded <Popover aria-label="Rounding" trigger={<Button size="sm" variant="ghost">How?</Button>}>To the nearest rupiah.</Popover> per line.</p>
    <p id="menu">Export as <Menu trigger={<Button size="sm" variant="ghost">format</Button>}><MenuItem>CSV</MenuItem></Menu> any time.</p>
  </div>
);

test('a Tooltip, HoverCard, Popover or Menu inside a paragraph keeps the paragraph whole, and hydrates without a mismatch', async () => {
  const host = document.createElement('div');
  host.innerHTML = renderToString(ui);
  document.body.appendChild(host);
  const lines = () => ['tip', 'card', 'pop', 'menu'].map((id) => host.querySelector('#' + id)!.textContent.trim().split(' ').pop());
  expect(lines()).toEqual(['abroad.', 'first.', 'line.', 'time.']);
  const errors: string[] = [], logError = console.error;
  console.error = (...a: unknown[]) => { errors.push(a.map(String).join(' ')); };
  let root: Root | undefined;
  try {
    flushSync(() => { root = hydrateRoot(host, ui, { onRecoverableError: (e) => errors.push(String(e)) }); });
    await new Promise((r) => setTimeout(r, 50));
  } finally { console.error = logError; }
  expect(errors).toEqual([]);
  root?.unmount(); host.remove();
});

// Open from the start, the panel's own parts are spans too: a <div> for a menu item or the popover's body ended the
// paragraph just the same.
const opened = (
  <div>
    <p id="pop">Totals are rounded <Popover defaultOpen aria-label="Rounding" trigger={<Button size="sm" variant="ghost">How?</Button>}>To the nearest rupiah.</Popover> per line.</p>
    <p id="menu">Export as <Menu defaultOpen trigger={<Button size="sm" variant="ghost">format</Button>}>
      <MenuGroup label="Files"><MenuItem>CSV</MenuItem></MenuGroup><MenuSeparator /><MenuSub label="More"><MenuItem>XML</MenuItem></MenuSub>
    </Menu> any time.</p>
  </div>
);

test('a Popover or Menu open from the start inside a paragraph keeps the paragraph whole', () => {
  const host = document.createElement('div');
  host.innerHTML = renderToString(opened);
  expect(['pop', 'menu'].map((id) => host.querySelector('#' + id)!.textContent.trim().split(' ').pop())).toEqual(['line.', 'time.']);
});
