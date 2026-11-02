import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { PageHeader } from './PageHeader';

/* Page header (BL1): the top of a page inside an app, as a block an app copies. PageHeader.mdx says what each part is
   for. A block is a section, not a page: these stories put it at the top of a small page (a skip link and main) so
   the page rules hold. */
const stay = () => {};
const meta = {
  title: 'Blocks/Page header',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="min-h-screen bg-surface text-text"><SkipLink /><main id="main" className="mx-auto max-w-5xl px-4 py-6 outline-none"><Story /></main></div>],
  args: {
    breadcrumb: [{ label: 'Home', href: '#home' }, { label: 'Projects', href: '#projects' }, { label: 'Website redesign' }],
    title: 'Website redesign',
    description: 'The new marketing site, from the first sketches to launch.',
    primary: { label: 'New task', onSelect: stay },
    secondary: [{ label: 'Share', onSelect: stay }, { label: 'Export', onSelect: stay }],
    sections: [{ label: 'Overview', href: '#overview', current: true }, { label: 'Tasks', href: '#tasks' }, { label: 'Activity', href: '#activity' }, { label: 'Settings', href: '#settings' }],
    sectionsLabel: 'Project',
  },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Everything: where the page is, its name and purpose, the actions, and links to its sections. */
export const Default: Story = {};

/** Only a title and one action, for a page at the top of the app. */
export const Simple: Story = { args: { breadcrumb: undefined, description: undefined, secondary: undefined, sections: undefined, title: 'Projects', primary: { label: 'New project', onSelect: stay } } };

/** A long title and description wrap; the actions move under the title when there's no room beside it. */
export const LongTitle: Story = { args: { title: 'Quarterly planning for the customer support knowledge base migration', description: 'Every article moves to the new help center by the end of the quarter, with redirects from the old addresses so no link breaks.' } };
