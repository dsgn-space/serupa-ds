import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelpCenter } from './HelpCenter';

/* Help center: the topics, the common questions with a search, and a message form that says when a person will
   answer. HelpCenter.mdx says why each part is there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Help center',
  component: HelpCenter,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HelpCenter>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four topics, four questions in two groups, and the message form. */
export const Default: Story = {};
