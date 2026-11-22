import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailPage } from './DetailPage';
import { Card } from '../../components/Card/Card';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';

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

/** A supporting pane, the project's activity, beside the tabs from 1024px. On a narrower screen it drops below them,
    in reading order. It's a complementary landmark named by its heading. */
export const WithActivity: Story = {
  args: {
    aside: {
      title: 'Activity',
      content: (
        <Card>
          <ol className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
            <li><strong>Ana Lima</strong> renamed the project <span className="text-text-muted">· 2 hours ago</span></li>
            <li><strong>Budi Santoso</strong> finished “Pick the photos” <span className="text-text-muted">· Yesterday</span></li>
            <li><strong>Ana Lima</strong> added 4 tasks <span className="text-text-muted">· 14 September</span></li>
          </ol>
        </Card>
      ),
    },
  },
};

/** Partly loaded: the project came in, its activity didn't. The pane says so in its own place, with Try again, and the
    tabs work as usual. */
export const Partial: Story = {
  args: {
    aside: {
      title: 'Activity',
      content: <Card><EmptyLoadFailed size="sm" headingLevel={3} title="Couldn’t load the activity" description="The project itself is up to date." onRetry={() => {}} /></Card>,
    },
  },
};

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
