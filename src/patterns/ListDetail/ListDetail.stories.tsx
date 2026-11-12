import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListDetail } from './ListDetail';

/* List and detail: messages beside the open one on a wide screen, one pane at a time on a phone. ListDetail.mdx says
   why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/List and detail',
  component: ListDetail,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListDetail>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Both panes: the list, a divider that moves with the arrow keys, and the open message. On a phone, the list alone. */
export const Default: Story = {};

/** Another message open: it's marked in the list, and its text is in the second pane. */
export const SecondOpen: Story = { args: { defaultSelected: 'm2' } };

/** No messages yet: an empty state that says what will show up here, in place of two empty panes. */
export const Empty: Story = { args: { messages: [] } };
