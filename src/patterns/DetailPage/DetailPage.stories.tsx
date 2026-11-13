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

/** The delete didn't go through: the dialog stays open, says so, and the delete can be tried again. Here `onDelete`
    rejects every time. */
export const DeleteFails: Story = { args: { deleteFailed: true, onDelete: () => Promise.reject(new Error('offline')) } };

/** The project is on its way: the way back, and a placeholder for its details, named once ("Loading project"). */
export const Loading: Story = { args: { loading: true } };

/** The project didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => new Promise((r) => setTimeout(r, 1000)) } };
