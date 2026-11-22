import type { Meta, StoryObj } from '@storybook/react-vite';
import { Profile } from './Profile';

/* Profile: what other people see of you, edited in one form and saved when you say so. Profile.mdx says why each part
   is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Profile',
  component: Profile,
  parameters: { layout: 'fullscreen' },
  args: { onSave: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof Profile>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The form beside a preview of what others see; Discard changes shows once something has changed. */
export const Default: Story = {};

/** Saving fails: the status says so with Try again, and the changes stay. */
export const SaveFails: Story = { tags: ['!visual'], args: { onSave: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };

/** A new profile: no photo yet, so the avatar shows initials, and nothing but a name. */
export const Empty: Story = { args: { profile: { name: 'Budi Santoso', bio: '', location: '', website: '', photo: '' } } };

/** The profile is on its way from the server: the h1 stays, with a placeholder under it. */
export const Loading: Story = { args: { loading: true } };

/** The profile didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
