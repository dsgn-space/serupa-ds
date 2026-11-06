import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dashboard } from './Dashboard';

/* Dashboard: the page an account lands on, with key numbers, usage, recent projects and activity. Dashboard.mdx says
   why each part is there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Dashboard',
  component: Dashboard,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Dashboard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A month in: the numbers with their change in words, storage almost full, the goal halfway, and the latest activity. */
export const Default: Story = {};

/** While the data loads: one named skeleton per part, and main says it's busy. */
export const Loading: Story = { args: { loading: true } };

/** The first visit, before any project: what a project is, and the one button that starts one. */
export const FirstRun: Story = {
  args: { data: { stats: [], storage: { used: 0, limit: 10 }, goal: { label: 'Launch checklist', done: 0, total: 5 }, projects: [], activity: [] } },
};
