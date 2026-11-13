import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Toaster, toast } from '../../components/Toast/Toast';
import { SerupaProvider } from '../../internal/provider';
import { CartSummary, type CartItem, type CartSummaryProps } from './CartSummary';

const items: CartItem[] = [
  { id: 'linen', name: 'Linen shirt', href: '/p/linen', price: 39, quantity: 2, max: 5 },
  { id: 'oxford', name: 'Oxford shirt', href: '/p/oxford', price: 32, quantity: 1 },
];
/** The cart with its items in state, as an app keeps them; onRemove and onQuantityChange are spied on too. */
function Cart({ initial = items, spy, ...rest }: Partial<CartSummaryProps> & { initial?: readonly CartItem[]; spy?: { remove?: (id: string) => void; quantity?: (id: string, n: number) => void } }) {
  const [list, setList] = React.useState(initial);
  return <SerupaProvider locale="en-US"><CartSummary items={list} currency="USD" onCheckout={() => {}} {...rest}
    onQuantityChange={(id, n) => { spy?.quantity?.(id, n); setList((all) => all.map((i) => (i.id === id ? { ...i, quantity: n } : i))); }}
    onRemove={(id) => { spy?.remove?.(id); setList((all) => all.filter((i) => i.id !== id)); }} /><Toaster /></SerupaProvider>;
}
// The cart's own items (the Toaster's toasts are list items too).
const rows = () => page.getByRole('region', { name: 'Your cart' }).getByRole('listitem').elements();
const sums = () => [...document.querySelectorAll('dl > div, dl > dt')].map((n) => (n.textContent || '').replace(/\s/g, ' '));
// What the page's announcer said last (the polite live region the announce helper writes to).
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((n) => n.textContent).join(' ');

afterEach(() => { toast.dismiss(); });

// Cart summary (RU19): a region named by its heading, items as a list with quantity and Remove named after each, Remove
// with Undo and focus kept, a coupon that says why it doesn't apply, and the new total said once it settles.
describe('Blocks/Cart summary', () => {
  test('a region named by its heading, the items a list, the sums a description list down to the total', async () => {
    await render(<Cart taxRate={0.1} />);
    await expect.element(page.getByRole('region', { name: 'Your cart' })).toBeVisible();
    expect(rows()).toHaveLength(2);
    expect(document.querySelector('ul')!.getAttribute('role')).toBe('list');
    expect(sums().join(' | ')).toMatch(/Subtotal.*\$110\.00.*Tax \(10%\).*\$11\.00.*Total.*\$121\.00/);
  });

  test('each quantity and Remove is named after its item, starting with the words people see', async () => {
    await render(<Cart />);
    await expect.element(page.getByRole('spinbutton', { name: 'Quantity, Linen shirt' })).toHaveValue('2');
    await expect.element(page.getByRole('button', { name: 'Remove Oxford shirt' })).toHaveTextContent('Remove');
  });

  test('a quantity changes the line and the total, and the new total is said once it settles', async () => {
    const quantity = vi.fn();
    await render(<Cart spy={{ quantity }} />);
    const field = page.getByRole('spinbutton', { name: 'Quantity, Oxford shirt' });
    await userEvent.click(field);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(quantity).toHaveBeenLastCalledWith('oxford', 3);
    await expect.poll(() => sums().join(' | ')).toMatch(/Total.*\$174\.00/);
    await expect.poll(said).toContain('Total $174.00');
  });

  test('Remove takes the item away at once with Undo, moves focus to the next name, and removes it for good only when the toast goes', async () => {
    const remove = vi.fn();
    await render(<Cart spy={{ remove }} />);
    await userEvent.click(page.getByRole('button', { name: 'Remove Linen shirt' }));
    await expect.poll(() => rows().length).toBe(1);
    await expect.poll(() => document.activeElement?.textContent).toBe('Oxford shirt');
    await userEvent.click(page.getByRole('button', { name: 'Undo' }));
    await expect.poll(() => rows().length).toBe(2);
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(page.getByRole('button', { name: 'Remove Oxford shirt' }));
    toast.dismiss();
    await expect.poll(() => remove.mock.calls).toEqual([['oxford']]);
  });

  test('an item removed for good and then added again (the same product) shows in the cart and its sums', async () => {
    let add: () => void = () => {};
    function Shop() {
      const [list, setList] = React.useState<readonly CartItem[]>(items);
      add = () => setList((all) => [...all, items[0]!]);
      return <SerupaProvider locale="en-US"><CartSummary items={list} currency="USD" onCheckout={() => {}} onQuantityChange={() => {}}
        onRemove={(id) => setList((all) => all.filter((i) => i.id !== id))} /><Toaster /></SerupaProvider>;
    }
    await render(<Shop />);
    await userEvent.click(page.getByRole('button', { name: 'Remove Linen shirt' }));
    toast.dismiss();
    await expect.poll(() => rows().length).toBe(1);
    add();
    await expect.poll(() => rows().map((r) => r.querySelector('a')?.textContent)).toEqual(['Oxford shirt', 'Linen shirt']);
    expect(sums()[0]).toContain('$110.00');
  });

  test('removing the last item leaves focus on the heading, and the empty cart says so with a way back', async () => {
    await render(<Cart initial={items.slice(1)} continueHref="/shop" />);
    await userEvent.click(page.getByRole('button', { name: 'Remove Oxford shirt' }));
    await expect.poll(() => document.activeElement?.textContent).toBe('Your cart');
    await expect.element(page.getByText('Your cart is empty.')).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/shop');
  });

  test('a coupon that doesn\'t apply says why in its field; one that does adds a discount line, and Remove coupon takes it off', async () => {
    const onApplyCoupon = (code: string) => (code === 'SAVE10' ? Promise.resolve(10) : Promise.reject(new Error('That code has expired.')));
    await render(<Cart onApplyCoupon={onApplyCoupon} />);
    const field = page.getByRole('textbox', { name: 'Coupon code' });
    await userEvent.type(field, 'OLD5{Enter}');
    await expect.element(field).toHaveAttribute('aria-invalid', 'true');
    await expect.element(field).toHaveAccessibleDescription(/That code has expired\./);
    await userEvent.clear(field);
    await userEvent.type(field, 'SAVE10');
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect.poll(() => sums().join(' | ')).toMatch(/Discount \(SAVE10\).*−\$10\.00.*Total.*\$100\.00/);
    await expect.element(field).toHaveValue('');
    await userEvent.click(page.getByRole('button', { name: 'Remove coupon' }));
    await expect.poll(() => sums().join(' | ')).not.toMatch(/Discount/);
  });

  test('Check out is busy until it settles', async () => {
    let done!: () => void;
    await render(<Cart onCheckout={() => new Promise<void>((r) => { done = r; })} />);
    const button = page.getByRole('button', { name: 'Check out' });
    await userEvent.click(button);
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    done();
    await expect.element(button).not.toHaveAttribute('aria-busy', 'true');
  });

  test('Check out right after a Remove, while its Undo is still up, removes the item for good first, so the order leaves it out', async () => {
    const ordered: string[][] = [];
    function Shop() {
      const [list, setList] = React.useState(items);
      return <SerupaProvider locale="en-US"><CartSummary items={list} currency="USD" onQuantityChange={() => {}}
        onRemove={(id) => setList((all) => all.filter((i) => i.id !== id))} onCheckout={() => { ordered.push(list.map((i) => i.id)); }} /><Toaster /></SerupaProvider>;
    }
    await render(<Shop />);
    await userEvent.click(page.getByRole('button', { name: 'Remove Linen shirt' }));
    await userEvent.click(page.getByRole('button', { name: 'Check out' }));
    await expect.poll(() => ordered).toEqual([['oxford']]);
    expect(page.getByRole('button', { name: 'Undo' }).elements()).toHaveLength(0);
  });

  test('money is written the locale\'s way, with the words in its language', async () => {
    await render(<SerupaProvider locale="id-ID"><CartSummary items={[{ id: 'b', name: 'Kemeja batik', price: 520000, quantity: 2 }]} currency="IDR" taxRate={0.11}
      onQuantityChange={() => {}} onRemove={() => {}} onCheckout={() => {}} labels={{ title: 'Keranjang Anda', tax: (r) => `PPN (${r})` }} /></SerupaProvider>);
    await expect.element(page.getByRole('region', { name: 'Keranjang Anda' })).toBeVisible();
    expect(sums().join(' | ')).toMatch(/PPN \(11%\).*Rp 114\.400.*Total.*Rp 1\.154\.400/);
  });
});
