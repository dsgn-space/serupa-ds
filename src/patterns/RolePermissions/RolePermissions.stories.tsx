import type { Meta, StoryObj } from '@storybook/react-vite';
import { RolePermissions } from './RolePermissions';

/* Roles and permissions: a grid of what each role can do, where a permission brings what it needs, saved together.
   RolePermissions.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Roles and permissions',
  component: RolePermissions,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RolePermissions>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four roles, the owner's locked. */
export const Default: Story = {};

/** Changes that can't be saved say so and stay. */
export const SaveFails: Story = { args: { onSave: () => Promise.reject(new Error('offline')) } };

/** While the roles load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
