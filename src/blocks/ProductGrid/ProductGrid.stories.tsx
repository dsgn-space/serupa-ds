import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Toaster } from '../../components/Toast/Toast';
import { SerupaProvider } from '../../internal/provider';
import { ProductGrid, type Product } from './ProductGrid';

/* Product grid (RU18): product cards in a grid, as a block an app copies. ProductGrid.mdx says what each part is
   for. The stories put it on a small page (a skip link, main, an h1 and the h2 the names' h3s sit under), with a
   Toaster for what Add to cart says. The pictures are drawn here, so the stories need no network. */
const wait = () => new Promise((resolve) => { window.setTimeout(resolve, 600); });
const fail = () => wait().then(() => { throw new Error('Out of stock'); });
const pic = (shirt: string, bg: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><path d="M150 90 L110 110 L70 170 L115 195 L130 175 V320 H270 V175 L285 195 L330 170 L290 110 L250 90 Q200 130 150 90Z" fill="${shirt}"/></svg>`);

const products: Product[] = [
  { id: 'linen', name: 'Linen shirt', href: '#linen', image: pic('#f5f0e6', '#d6cfc0'), price: 39, rating: 4.5, reviews: 128 },
  { id: 'oxford', name: 'Oxford shirt', href: '#oxford', image: pic('#9db4d9', '#e3e8f0'), price: 32, was: 40, rating: 4.2, reviews: 64 },
  { id: 'batik', name: 'Batik shirt, short sleeves', href: '#batik', image: pic('#7a3b1d', '#ecd9c6'), price: 45, rating: 4.8, reviews: 1204 },
  { id: 'flannel', name: 'Flannel shirt', href: '#flannel', image: pic('#9b2c2c', '#e5dada'), price: 48, rating: 3.9, reviews: 1, soldOut: true },
  { id: 'denim', name: 'Denim shirt', href: '#denim', image: pic('#3c5a80', '#d9e0ea'), price: 52.5, was: 70 },
  { id: 'polo', name: 'Polo shirt', href: '#polo', image: pic('#2f6b4f', '#d7e6dd'), price: 28, rating: 4.1, reviews: 37 },
];

function Page({ children, title = 'Shirts', section = 'New this week' }: { children: React.ReactNode; title?: string; section?: string }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 outline-none">
    <Heading level={1}>{title}</Heading><Heading level={2} size="lg">{section}</Heading>{children}<Toaster /></main></div>;
}

const meta = {
  title: 'Blocks/Product grid',
  component: ProductGrid,
  parameters: { layout: 'fullscreen' },
  args: { products, currency: 'USD', onAddToCart: wait },
  render: (args) => <Page><ProductGrid {...args} /></Page>,
} satisfies Meta<typeof ProductGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Six products: two on sale, with the old price after "Was" and the saving in words; one sold out, saying so in place of its button. */
export const Default: Story = {};

/** Adding fails: the button is busy while it tries, then a toast says it couldn't add it and to try again. */
export const AddFails: Story = { args: { onAddToCart: fail } };

/** In Indonesian rupiah, with the words in Indonesian: money and counts are written the locale's way. */
export const Indonesian: Story = {
  args: {
    currency: 'IDR',
    products: products.map((p) => ({ ...p, price: p.price * 16000, was: p.was && p.was * 16000 })),
    labels: { was: 'Sebelumnya', off: (n) => `Hemat ${n}%`, rating: 'Penilaian', reviews: (_, f) => `${f} ulasan`, addToCart: 'Tambah ke keranjang',
      added: (name) => `${name} masuk ke keranjang`, notAdded: (name) => `${name} belum masuk ke keranjang. Coba lagi.`, soldOut: 'Habis' },
  },
  render: (args) => <SerupaProvider locale="id-ID"><Page title="Kemeja" section="Baru minggu ini"><ProductGrid {...args} /></Page></SerupaProvider>,
};

/** A long name wraps inside its card, and a price in the millions still fits a phone's column. */
export const LongText: Story = {
  args: {
    currency: 'EUR',
    products: [
      { id: 'lang', name: 'Langärmeliges Baumwollhemd mit Knopfleiste und Brusttasche', href: '#lang', image: pic('#5b6c8f', '#dde2ec'), price: 1249999.99, was: 1499999.99, rating: 5, reviews: 23456 },
      ...products.slice(0, 2),
    ],
  },
};
