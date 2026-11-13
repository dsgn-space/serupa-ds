import * as React from 'react';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Toaster, toast } from '../../components/Toast/Toast';
import { SerupaProvider } from '../../internal/provider';
import { ProductGrid, type Product } from './ProductGrid';

const PIC = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#9db4d9"/></svg>');
const products: Product[] = [
  { id: 'linen', name: 'Linen shirt', href: '/p/linen', image: PIC, price: 39, rating: 4.5, reviews: 1204 },
  { id: 'oxford', name: 'Oxford shirt', href: '/p/oxford', image: PIC, price: 32, was: 40, rating: 4, reviews: 1 },
  { id: 'flannel', name: 'Flannel shirt', href: '/p/flannel', image: PIC, price: 48, soldOut: true },
];
const grid = (p: Partial<React.ComponentProps<typeof ProductGrid>> = {}) => (
  <SerupaProvider locale="en-US"><ProductGrid products={products} currency="USD" onAddToCart={() => {}} {...p} /><Toaster /></SerupaProvider>
);
const card = (name: string) => page.getByRole('listitem', { name }).element() as HTMLElement;
const text = (name: string) => (card(name).textContent || '').replace(/\s/g, ' ');

afterEach(() => { toast.dismiss(); });

// Product grid (RU18): products as a list of cards named by their headings, the name the one link, a sale said in
// words, the rating as one named image with its review count, and Add to cart named after its product, busy while it
// adds, then a toast.
describe('Blocks/Product grid', () => {
  test('two grids with the same product (recommended, recently viewed) each name their own card: no id is used twice', async () => {
    await render(<SerupaProvider locale="en-US">
      <ProductGrid products={products} currency="USD" onAddToCart={() => {}} />
      <ProductGrid products={products.slice(0, 1)} currency="USD" onAddToCart={() => {}} />
    </SerupaProvider>);
    const ids = [...document.querySelectorAll('[id]')].map((n) => n.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
    const cards = [...document.querySelectorAll<HTMLElement>('li[aria-labelledby]')];
    expect(cards.map((c) => c.contains(document.getElementById(c.getAttribute('aria-labelledby')!)))).toEqual([true, true, true, true]);
  });

  test('server-rendered, a card hydrates without a mismatch: the rating, a <div>, isn\'t inside a <p>', async () => {
    const html = renderToString(grid());
    const host = document.createElement('div');
    host.innerHTML = html;   // as the browser parses it: a <div> ends an open <p>
    document.body.append(host);
    const errors: unknown[] = [];
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => { root = hydrateRoot(host, grid(), { onRecoverableError: (e) => errors.push(e) }); });
    error.mockRestore();
    expect([errors, host.querySelectorAll('p > div, p div').length]).toEqual([[], 0]);
    act(() => root!.unmount());
    host.remove();
  });

  test('a list of cards, each named by its product, whose name is a heading holding the one link to its page', async () => {
    await render(grid());
    expect(page.getByRole('listitem').elements()).toHaveLength(3);
    await expect.element(page.getByRole('heading', { level: 3, name: 'Oxford shirt' })).toBeVisible();
    expect(page.getByRole('link').elements().map((a) => a.getAttribute('href'))).toEqual(['/p/linen', '/p/oxford', '/p/flannel']);
    // The picture is decorative beside the name, so a reader hears each product once.
    expect([...card('Linen shirt').querySelectorAll('img')].map((i) => i.getAttribute('alt'))).toEqual(['']);
  });

  test('a sale says "Was" before the old price and the saving in words, not with a strike-through alone', async () => {
    await render(grid());
    expect(text('Oxford shirt')).toContain('$32Was $4020% off');
    expect(card('Oxford shirt').querySelector('del')!.textContent).toBe('$40');
    expect(text('Linen shirt')).not.toContain('Was');
  });

  test('the rating is one image named by its value, with the number of reviews in text in the locale\'s digits', async () => {
    await render(grid());
    await expect.element(page.getByRole('img', { name: 'Rating, 4.5 out of 5' })).toBeVisible();
    expect(text('Linen shirt')).toContain('1,204 reviews');
    expect(text('Oxford shirt')).toContain('1 review');
    expect(card('Flannel shirt').querySelector('[role="img"]')).toBeNull();
  });

  test('Add to cart starts with its visible words and ends with the product; sold out says so in its place', async () => {
    await render(grid());
    expect(page.getByRole('button').elements().map((b) => [b.textContent, b.getAttribute('aria-label')])).toEqual([['Add to cart', 'Add to cart, Linen shirt'], ['Add to cart', 'Add to cart, Oxford shirt']]);
    expect(text('Flannel shirt')).toContain('Sold out');
  });

  test('adding: the button is busy until it settles, then a toast says what was added', async () => {
    let done!: () => void;
    const onAddToCart = vi.fn(() => new Promise<void>((r) => { done = r; }));
    await render(grid({ onAddToCart }));
    const button = page.getByRole('button', { name: 'Add to cart, Oxford shirt' });
    await userEvent.click(button);
    expect(onAddToCart).toHaveBeenCalledWith('oxford');
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    done();
    await expect.element(page.getByText('Added Oxford shirt to your cart')).toBeVisible();
    await expect.element(button).not.toHaveAttribute('aria-busy', 'true');
  });

  test('when adding fails, a toast says it wasn\'t added and to try again, and the button is ready again', async () => {
    await render(grid({ onAddToCart: () => Promise.reject(new Error('Out of stock')) }));
    await userEvent.click(page.getByRole('button', { name: 'Add to cart, Linen shirt' }));
    await expect.element(page.getByText('Couldn’t add Linen shirt to your cart. Try again.')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Add to cart, Linen shirt' })).not.toHaveAttribute('aria-busy', 'true');
  });

  test('money and counts are written the locale\'s way, with the words in its language', async () => {
    const rupiah: Product[] = [{ id: 'batik', name: 'Kemeja batik', href: '#', image: PIC, price: 520000, was: 650000, rating: 5, reviews: 2345 }];
    await render(<SerupaProvider locale="id-ID"><ProductGrid products={rupiah} currency="IDR" onAddToCart={() => {}}
      labels={{ was: 'Sebelumnya', off: (n) => `Hemat ${n}%`, reviews: (_, f) => `${f} ulasan`, addToCart: 'Tambah ke keranjang' }} /></SerupaProvider>);
    expect(text('Kemeja batik')).toContain('Rp 520.000Sebelumnya Rp 650.000Hemat 20%');
    expect(text('Kemeja batik')).toContain('2.345 ulasan');
    await expect.element(page.getByRole('button', { name: 'Tambah ke keranjang, Kemeja batik' })).toBeVisible();
  });

  test('the grid keeps role="list", since Safari stops calling a list without bullets a list', async () => {
    await render(grid());
    const bare = [...document.querySelectorAll('ul, ol')].filter((l) => getComputedStyle(l).listStyleType === 'none' && !l.closest('[role="region"], section'));
    expect(bare.map((l) => l.getAttribute('role'))).toEqual(['list']);
  });
});
