import type { Meta, StoryObj } from '@storybook/react-vite';
import { TeamMembers } from './TeamMembers';

/* Team members: the people on a team with their roles, inviting more, and removing someone with Undo.
   TeamMembers.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Team members',
  component: TeamMembers,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TeamMembers>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four members, the owner first, each other one with a role picker and Remove, and an invite not yet accepted. */
export const Default: Story = {};

/** A new team: only you, and no invites waiting. */
export const JustYou: Story = { args: { members: [{ id: 'u1', name: 'Ana Lima', email: 'ana@example.com', role: 'owner', you: true }], invites: [] } };

/** The team is on its way: placeholder rows, named once ("Loading members"). */
export const Loading: Story = { args: { loading: true } };

/** The team didn't load: the page says so, and Try again loads it again. */
export const LoadFailed: Story = { args: { loadFailed: true, onRetry: () => new Promise((r) => setTimeout(r, 1000)) } };
