import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddressBook } from './AddressBook';

/* Address book: saved addresses with a default, each edited, removed or made the default in place.
   AddressBook.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Address book',
  component: AddressBook,
  parameters: { layout: 'fullscreen' },
  args: { onSave: () => new Promise((ok) => setTimeout(() => ok('a9'), 600)) },
} satisfies Meta<typeof AddressBook>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Two addresses; Home is the default, so it has no Remove. */
export const Default: Story = {};

/** None saved yet. */
export const Empty: Story = { args: { addresses: [] } };

/** Saving fails: the dialog says so and keeps every field. */
export const SaveFails: Story = { tags: ['!visual'], args: { onSave: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** On their way from the server. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
