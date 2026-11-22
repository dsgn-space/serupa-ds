import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShareDialog } from './ShareDialog';

/* Share dialog: who can open one document, what each may do, and the link to it.
   ShareDialog.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Share dialog',
  component: ShareDialog,
  parameters: { layout: 'fullscreen' },
  // The device's share sheet differs by browser: left out, so every browser draws the same picture.
  args: { nativeShare: null },
} satisfies Meta<typeof ShareDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The document's page: Share in the header, with the people it's shared with beside it. */
export const Default: Story = {};

/** The dialog: add people, each person's access with Remove, the link's setting, and Copy link. */
export const Open: Story = { args: { defaultOpen: true } };

/** Not shared yet: only the owner, and no faces in the header. */
export const NotShared: Story = { args: { defaultOpen: true, people: [{ id: 'u1', name: 'Ana Lima', email: 'ana@example.com', access: 'owner', you: true }] } };

/** Anyone with the link can view: the hint under the picker says what that means. */
export const AnyoneWithTheLink: Story = { args: { defaultOpen: true, linkAccess: 'view' } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };

/** Adding people fails: what was typed stays, and it says so. At rest it looks like Open, so it has no screenshot. */
export const ShareFails: Story = { tags: ['!visual'], args: { defaultOpen: true, onInvite: () => new Promise((_, no) => setTimeout(() => no(new Error('offline')), 600)) } };
