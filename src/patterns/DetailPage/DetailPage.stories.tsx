import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailPage } from './DetailPage';

/* Detail page: one project with a breadcrumb, its name and details editable in place, tabs, removals with Undo and a
   delete behind typing its name. DetailPage.mdx says why each part is there and what stays the app's job. The links
   go nowhere here. */
const meta = {
  title: 'Patterns/Detail page',
  component: DetailPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DetailPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The Overview tab: the breadcrumb, the name as the h1, and the details, each editable in place. */
export const Default: Story = {};
