import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductPage } from './ProductPage';

/* Product page: one product with its pictures, price, choices and Add to cart. ProductPage.mdx says why each part
   is there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Product page',
  component: ProductPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProductPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A shirt on sale, in two colors and four sizes, one of them sold out. Add to cart with no size to see what it asks for. */
export const Default: Story = {};

/** Adding fails: pick a color and a size, then Add to cart. The page says so above the button and keeps every choice. */
export const AddFails: Story = { tags: ['!visual'], args: { onAddToCart: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** None left: the page says "Sold out" in words where the choices and Add to cart would be. */
export const SoldOut: Story = {
  args: {
    product: {
      name: 'Flannel shirt', summary: 'A brushed cotton flannel for cold mornings.', price: 48, rating: 3.9, left: 0,
      pictures: [{ src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e5dada"/><path d="M150 90 L110 110 L70 170 L115 195 L125 180 L125 320 L275 320 L275 180 L285 195 L330 170 L290 110 L250 90 Q200 125 150 90 Z" fill="#9b2c2c"/></svg>'), alt: 'The front of the shirt in Red' }],
      options: [{ id: 'size', label: 'Size', choices: [{ value: 'm', label: 'M', soldOut: true }] }],
      details: [{ term: 'Fabric', value: '100% cotton' }],
      delivery: 'Free delivery in 3 to 5 working days.',
      reviews: [],
    },
  },
};

/** The product is on its way: placeholders where the pictures and the words will be. */
export const Loading: Story = { args: { loading: true } };

/** The product didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
