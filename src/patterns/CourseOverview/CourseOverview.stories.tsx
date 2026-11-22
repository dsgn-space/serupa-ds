import type { Meta, StoryObj } from '@storybook/react-vite';
import { CourseOverview } from './CourseOverview';

/* Course overview: modules and lessons, progress, Continue, and marking lessons done. CourseOverview.mdx says why
   each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Course overview',
  component: CourseOverview,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CourseOverview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A third of the way through. */
export const Default: Story = {};

/** Not started: Continue opens the first lesson. */
export const NotStarted: Story = { args: { defaultDone: [] } };

/** Every lesson done: the certificate. */
export const Finished: Story = { args: { defaultDone: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10'] } };

/** While the lessons load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
