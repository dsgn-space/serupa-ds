import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileBrowser } from './FileBrowser';

/* File browser: a folder's files as a list to pick from, with move and delete for several at once and rename, move and
   delete on each row. FileBrowser.mdx says why each part is there and what stays the app's job. The links go nowhere
   here. */
const meta = {
  title: 'Patterns/File browser',
  component: FileBrowser,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FileBrowser>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A folder with a subfolder and five files: each row says its size and when it changed, and has a More menu. */
export const Default: Story = {};

/** Three files picked: the bar says how many, with Move, Delete and Clear selection. */
export const Selected: Story = { args: { defaultSelected: ['f2', 'f3', 'f4'] } };

/** A folder with nothing in it: what to do, and Upload files. */
export const Empty: Story = { args: { files: [] } };

/** The files are on their way: a busy list with placeholder rows. */
export const Loading: Story = { args: { loading: true } };

/** The files didn't load: the page says so, and Try again loads them again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
