import type { Meta, StoryObj } from '@storybook/react-vite';
import { TaskBoard } from './TaskBoard';

/* Task board: a team's tasks in columns, saved as they move, with a way to add one. TaskBoard.mdx says why each part
   is there and what stays the app's job. The links go nowhere here. */
const meta = {
  title: 'Patterns/Task board',
  component: TaskBoard,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TaskBoard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A sprint in four columns, two with a limit. Each card moves by its handle, the keyboard or its "Move to…" menu. */
export const Default: Story = {};

/** "In progress" holds more than its limit: its count says so, and a line above the board says what to do. */
export const OverLimit: Story = {
  args: {
    columns: [
      { id: 'todo', title: 'To do', items: [{ id: 't1', title: 'Fix login on Safari', assignee: 'Budi Santoso', tag: 'Bug' }] },
      { id: 'doing', title: 'In progress', limit: 2, items: [
        { id: 't4', title: 'Dark mode for charts', assignee: 'Ana Lima' },
        { id: 't5', title: 'Invoice PDF export', assignee: 'Chen Wei' },
        { id: 't2', title: 'Write the release notes', assignee: 'Ana Lima' },
      ] },
      { id: 'done', title: 'Done', items: [] },
    ],
  },
};

/** A move that can't be saved: move any card, and it goes back with a message that names it and its column. */
export const MoveFails: Story = { tags: ['!visual'], args: { onMove: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** The tasks are on their way: each column keeps its title, with placeholder cards. */
export const Loading: Story = { args: { loading: true } };

/** The tasks didn't load: the page says so, and Try again loads them again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** A new board: the columns with nothing in them, and Add task. */
export const Empty: Story = { args: { columns: [{ id: 'todo', title: 'To do', items: [] }, { id: 'doing', title: 'In progress', items: [] }, { id: 'done', title: 'Done', items: [] }] } };
