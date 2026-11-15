import type { Meta, StoryObj } from '@storybook/react-vite';
import { Article } from './Article';

/* Article: one post with its byline, "On this page" and what to read next. Article.mdx says why each part is there
   and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Article',
  component: Article,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Article>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A product update: title, summary, byline, three sections, two posts to read next. */
export const Default: Story = {};

/** A post on its own, with nothing to read next: the section isn't there. */
export const NothingNext: Story = { args: { related: [] } };
