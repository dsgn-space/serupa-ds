import type { Meta, StoryObj } from '@storybook/react-vite';
import { AcceptInvite } from './AcceptInvite';

/* Accept invite: who invited you, to what and as what, the account you'd join with, and Join or Decline; or why an
   invite can't be used. AcceptInvite.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Accept invite',
  component: AcceptInvite,
  parameters: { layout: 'fullscreen' },
  args: { onJoin: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof AcceptInvite>;
export default meta;
type Story = StoryObj<typeof meta>;

const invite = {
  from: 'Dewi Lestari', workspace: 'Acme Design', role: 'Editor', roleCan: 'Edit files and comment; only admins invite people or change billing.',
  email: 'ana@example.com', members: ['Dewi Lestari', 'Chen Wei', 'Eko Prasetyo', 'Sara Haddad', 'Lena Vogel', 'Tomás Ruiz', 'Kofi Mensah'],
  expires: '2099-03-20T17:00:00Z',
};

/** An open invite, signed in with the address it went to. */
export const Default: Story = {};

/** Signed in with another account: it says so before Join. */
export const OtherAccount: Story = { args: { signedInAs: 'ana.lima@work.example' } };

/** The invite has ended: why, and who to ask. */
export const Ended: Story = { args: { invite: { ...invite, expires: '2026-01-10T17:00:00Z' }, now: new Date('2026-02-01T00:00:00Z') } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** Join fails: it says nothing has changed, and Join can be pressed again. At rest it looks like Default, so it has no screenshot. */
export const JoinFails: Story = { tags: ['!visual'], args: { onJoin: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };
