import type { Meta, StoryObj } from '@storybook/react-vite';
import { PermissionRequest } from './PermissionRequest';

/* Permission request: asks for the camera only when someone chooses to turn it on, says why first, and has a way on
   when the browser says no. PermissionRequest.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Permission request',
  component: PermissionRequest,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PermissionRequest>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Not asked yet: why the camera is wanted, and one button that opens the browser's question. */
export const BeforeAsking: Story = {};

/** The browser said yes. */
export const Granted: Story = { args: { initial: 'granted' } };

/** The browser said no: where to change it, Try again, and the call still goes ahead with audio only. */
export const Denied: Story = { args: { initial: 'denied', request: () => Promise.resolve('denied') } };

/** No camera in this browser: said as information, and the page still works. */
export const Unsupported: Story = { args: { initial: 'unsupported' } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
