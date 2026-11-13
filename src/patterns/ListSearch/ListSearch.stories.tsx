import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListSearch } from './ListSearch';

/* List with search and filters: search, filters, sort, selection and pages over a table, with the view kept in
   the address. ListSearch.mdx says why each part is there and what stays the app's job. The stories start from a
   query string and don't write the address. */
const meta = {
  title: 'Patterns/List with search and filters',
  component: ListSearch,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListSearch>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Every project, sorted by name, ten to a page. */
export const Default: Story = {};

/** Opened from a shared link: "?status=Active&sort=updated&dir=descending", so the list starts filtered and sorted. */
export const FromALink: Story = { args: { search: '?status=Active&sort=updated&dir=descending' } };

/** A search that finds nothing: it says so, with the search in words, and offers Clear filters. */
export const NoResults: Story = { args: { search: '?q=rocket' } };

/** While the rows load: the count says "Loading projects", and the table keeps its header over placeholder rows. */
export const Loading: Story = { args: { loading: true } };

/** The rows failed to load: what happened and Try again in the table's place, said once. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => {} } };

/** No projects at all: a first visit, with New project, not a search that missed. */
export const NoProjects: Story = { args: { projects: [] } };
