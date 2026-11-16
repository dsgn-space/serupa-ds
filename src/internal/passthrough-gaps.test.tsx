import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { TableColumnsMenu } from '../components/Table/Table';
import { Toaster } from '../components/Toast/Toast';

// Every component that draws an element of its own hands it ref, className, style, data-* and aria-* (the contract
// every other one keeps): these two were the last that didn't.
describe('ref and the rest reach the element', () => {
  test('Toaster: ref is its region', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<Toaster ref={ref} data-x="y" />);
    const region = page.getByRole('region', { name: 'Notifications' }).element();
    expect([ref.current === region, region.dataset.x]).toEqual([true, 'y']);
  });

  test('TableColumnsMenu: ref, className, style, data-* and aria-* reach the Columns button, which still opens the panel', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    const columns = [{ id: 'name', label: 'Name', visible: true }, { id: 'role', label: 'Role', visible: true }];
    await render(<TableColumnsMenu ref={ref} className="extra" style={{ marginInlineStart: 8 }} data-x="y" aria-describedby="hint" columns={columns} onColumnsChange={() => {}} />);
    const button = page.getByRole('button', { name: 'Columns' }).element() as HTMLButtonElement;
    expect([ref.current === button, button.classList.contains('extra'), button.style.marginInlineStart, button.dataset.x, button.getAttribute('aria-describedby')])
      .toEqual([true, true, '8px', 'y', 'hint']);
    await userEvent.click(button);
    await expect.element(page.getByRole('checkbox', { name: 'Role' })).toBeVisible();
  });
});
