import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { Toaster } from '../../components/Toast/Toast';
import { SerupaProvider } from '../../internal/provider';
import { CartSummary, type CartItem, type CartSummaryProps } from './CartSummary';

/* Cart summary (RU19): the cart's items, a coupon and the total, as a block an app copies. CartSummary.mdx says what
   each part is for. The stories put it on a small page (a skip link, main and an h1) in a Card, with a Toaster for
   Remove's Undo, and keep the items in state so quantities and Remove work. SAVE10 takes 10 off; any other code
   doesn't apply. The pictures are drawn here, so the stories need no network. */
const wait = () => new Promise((resolve) => { window.setTimeout(resolve, 600); });
const pic = (shirt: string, bg: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><path d="M150 90 L110 110 L70 170 L115 195 L130 175 V320 H270 V175 L285 195 L330 170 L290 110 L250 90 Q200 130 150 90Z" fill="${shirt}"/></svg>`);
const items: CartItem[] = [
  { id: 'linen', name: 'Linen shirt', href: '#linen', image: pic('#f5f0e6', '#d6cfc0'), price: 39, quantity: 2, max: 5 },
  { id: 'oxford', name: 'Oxford shirt', href: '#oxford', image: pic('#9db4d9', '#e3e8f0'), price: 32, quantity: 1 },
  { id: 'batik', name: 'Batik shirt, short sleeves', href: '#batik', image: pic('#7a3b1d', '#ecd9c6'), price: 45.5, quantity: 1, max: 1 },
];

/** Keeps the items in state, so the quantities and Remove work in the story. */
function Live({ initial, ...rest }: Omit<CartSummaryProps, 'items' | 'onQuantityChange' | 'onRemove'> & { initial: readonly CartItem[] }) {
  const [list, setList] = React.useState(initial);
  return <CartSummary {...rest} items={list}
    onQuantityChange={(id, quantity) => setList((all) => all.map((i) => (i.id === id ? { ...i, quantity } : i)))}
    onRemove={(id) => setList((all) => all.filter((i) => i.id !== id))} />;
}
const coupon = (code: string) => wait().then(() => {
  if (code.toUpperCase() === 'SAVE10') return 10;
  throw new Error(`${code} isn't a code we know. Check it against the email it came in.`);
});

function Page({ children, title = 'Cart' }: { children: React.ReactNode; title?: string }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6 outline-none">
    <Heading level={1}>{title}</Heading><Card padding="lg">{children}</Card><Toaster /></main></div>;
}

const meta = {
  title: 'Blocks/Cart summary',
  component: CartSummary,
  parameters: { layout: 'fullscreen' },
  args: { items, currency: 'USD', taxRate: 0.08, onApplyCoupon: coupon, onCheckout: wait, onQuantityChange: () => {}, onRemove: () => {} },
  render: ({ items: initial, onQuantityChange: _q, onRemove: _r, ...args }) => <Page><Live initial={initial} {...args} /></Page>,
} satisfies Meta<typeof CartSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three items: change a quantity or remove one (with Undo) and the new total is said; SAVE10 takes 10 off. */
export const Default: Story = {};

/** An empty cart says so, with a way back to the shop. */
export const Empty: Story = { args: { items: [] } };

/** In Indonesian rupiah with 11% PPN, the words in Indonesian: money is written the locale's way. */
export const Indonesian: Story = {
  args: {
    currency: 'IDR', taxRate: 0.11,
    items: items.map((i) => ({ ...i, price: i.price * 16000 })),
    onApplyCoupon: (code) => wait().then(() => { if (code.toUpperCase() === 'HEMAT') return 50000; throw new Error(`Kode ${code} tidak dikenal.`); }),
    labels: { title: 'Keranjang Anda', each: (p) => `${p} per item`, quantity: (n) => `Jumlah, ${n}`, remove: 'Hapus', removed: (n) => `${n} dihapus`,
      coupon: 'Kode kupon', apply: 'Pakai', discount: (c) => `Diskon (${c})`, removeCoupon: 'Hapus kupon', subtotal: 'Subtotal', tax: (r) => `PPN (${r})`,
      total: 'Total', totalIs: (t) => `Total ${t}`, checkout: 'Bayar', empty: 'Keranjang Anda kosong.', continueShopping: 'Lanjut belanja' },
  },
  render: ({ items: initial, onQuantityChange: _q, onRemove: _r, ...args }) => <SerupaProvider locale="id-ID"><Page title="Keranjang"><Live initial={initial} {...args} /></Page></SerupaProvider>,
};

/** A long name wraps, and amounts in the millions still fit a phone. */
export const LongText: Story = {
  args: {
    currency: 'EUR',
    items: [{ id: 'lang', name: 'Langärmeliges Baumwollhemd mit Knopfleiste und Brusttasche', href: '#lang', image: pic('#5b6c8f', '#dde2ec'), price: 1249999.99, quantity: 3 }, ...items.slice(1, 2)],
  },
};
