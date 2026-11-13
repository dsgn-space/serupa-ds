import type { Meta, StoryObj } from '@storybook/react-vite';
import { Integrations } from './Integrations';

/* Integrations: the apps a workspace can connect, which are connected, connecting one and disconnecting one after asking.
   Integrations.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Integrations',
  component: Integrations,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Integrations>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Six apps: two connected, four to connect, with a search over both lists. */
export const Default: Story = {};

/** The apps are on their way: placeholder cards, named once ("Loading integrations"). */
export const Loading: Story = { args: { loading: true } };

/** The apps didn't load: the page says so, and Try again loads them again. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => new Promise((r) => setTimeout(r, 1000)) } };
