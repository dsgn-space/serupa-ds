import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApiKeys } from './ApiKeys';

/* API keys: a workspace's keys with what each may do, creating one that's shown once, and revoking one after asking.
   ApiKeys.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/API keys',
  component: ApiKeys,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ApiKeys>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three keys, each with its last four characters, its access in words, when it was made and last used, and Revoke. */
export const Default: Story = {};

/** A new workspace: no keys yet, and what one is for. */
export const Empty: Story = { args: { keys: [] } };

/** The keys are on their way: a busy table with placeholder rows. */
export const Loading: Story = { args: { loading: true } };

/** The keys didn't load: the page says so, and Try again loads them again. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => new Promise((r) => setTimeout(r, 1000)) } };
