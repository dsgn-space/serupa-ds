import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast, Toaster } from './Toast';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import * as icons from '../../material/builtin';

const meta = {
  title: 'Components/Feedback/Toast',
  component: Toaster,
  args: { placement: 'bottom-end' },
  argTypes: { placement: { control: 'select', options: ['bottom-end', 'bottom-start', 'bottom-center', 'top-start', 'top-center', 'top-end'] }, duration: { control: 'number' }, autoDismiss: { control: 'boolean' } },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Toaster {...args} />
      <Button variant="secondary" onClick={() => toast('Link copied')}>Neutral</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Changes saved', tone: 'success' })}>Success</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'New version available', description: 'Reload to update.', tone: 'info' })}>Info</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Storage almost full', tone: 'warning' })}>Warning</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Upload failed', description: 'The file is over 10 MB.', tone: 'danger' })}>Danger</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Moved to trash', action: { label: 'Undo', onClick: () => toast('Restored') } })}>With an action</Button>
      {/* autoDismiss: false, for a message someone has to act on: it stays until it's closed. */}
      <Button variant="secondary" onClick={() => toast({ title: 'Couldn’t send the invoice', description: 'The connection dropped.', tone: 'danger', autoDismiss: false, action: { label: 'Retry', onClick: () => toast('Sending again') } })}>Stays until closed</Button>
    </div>
  ),
} satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// Shows the given toasts while the story is open (they stay until closed), and clears them when it closes.
function Showing(props: { placement?: React.ComponentProps<typeof Toaster>['placement']; limit?: number; toasts: Parameters<typeof toast>[0][] }) {
  // The toasts it opened with: shown once on mount, not again when a re-render passes a new array.
  const toasts = React.useRef(props.toasts);
  React.useEffect(() => { toasts.current.forEach((o) => toast(typeof o === 'string' ? { title: o, duration: 0 } : { duration: 0, ...o })); return () => toast.dismiss(); }, []);
  return <Toaster placement={props.placement} limit={props.limit} />;
}

export const Tones: Story = {
  render: (args) => <Showing placement={args.placement} limit={5} toasts={[
    'Link copied',
    { title: 'New version available', description: 'Reload to update.', tone: 'info' },
    { title: 'Changes saved', tone: 'success' },
    { title: 'Storage almost full', description: 'You’ve used 9.6 of 10 GB.', tone: 'warning' },
    { title: 'Upload failed', description: 'The file is over 10 MB.', tone: 'danger' },
  ]} />,
};
export const WithAction: Story = {
  render: (args) => <Showing placement={args.placement} toasts={[{ title: 'Moved to trash', description: 'Atlas and 3 files.', action: { label: 'Undo', onClick: () => {} } }]} />,
};
export const TopStart: Story = {
  args: { placement: 'top-start' },
  render: (args) => <Showing placement={args.placement} toasts={['Copied to clipboard']} />,
};
export const BottomCenter: Story = {
  args: { placement: 'bottom-center' },
  render: (args) => <Showing placement={args.placement} toasts={['Copied to clipboard']} />,
};
export const TopCenter: Story = {
  args: { placement: 'top-center' },
  render: (args) => <Showing placement={args.placement} toasts={['Copied to clipboard', { title: 'Changes saved', tone: 'success' }]} />,
};
/** A burst: the same error three times is one toast with a count, and past the limit (3) the rest wait under "+2 more". */
export const Burst: Story = {
  render: (args) => <Showing placement={args.placement} toasts={[
    'Photo 1 uploaded', 'Photo 2 uploaded', 'Photo 3 uploaded', 'Photo 4 uploaded',
    { title: 'Network error', tone: 'danger' }, { title: 'Network error', tone: 'danger' }, { title: 'Network error', tone: 'danger' },
  ]} />,
};

export const LongText: Story = {
  render: (args) => <Showing placement={args.placement} toasts={[
    { title: 'Your export of every project, task and comment from the last year is ready', description: 'Download it within 7 days from Settings. Donaudampfschifffahrtsgesellschaftskapitänskajüte.', tone: 'success', action: { label: 'Download the export', onClick: () => {} } },
  ]} />,
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't"). The Toaster sits in a
// corner of the screen, so these draw one toast in place, with the Toast's own classes, to sit side by side.
function Sketch({ title, description, success, action }: { title: string; description?: string; success?: boolean; action?: string }) {
  return <div className={'dk-toast dk-toast--' + (success ? 'success' : 'neutral')} style={{ width: 360, boxShadow: 'none' }}>
    {success ? <span className="dk-toast__icon" aria-hidden="true"><Icon icon={icons.CheckCircle} /></span> : null}
    <div className="dk-toast__content"><p className="dk-toast__title">{title}</p>{description ? <p className="dk-toast__description">{description}</p> : null}</div>
    {action ? <Button className="dk-toast__action" size="sm" variant="secondary">{action}</Button> : null}
    <IconButton className="dk-toast__close" icon={icons.Close} label="Dismiss" size="sm" hideTitle />
  </div>;
}
/** Do: a few words that say what happened. */
export const DoShortTitle: Story = {
  name: 'Do: say what happened',
  render: () => <Sketch success title="Changes saved" />,
};
/** Don't: a sentence to read before it goes. */
export const DontWordyTitle: Story = {
  name: "Don't: a sentence to read",
  render: () => <Sketch success title="Your changes have been saved successfully to your account." />,
};
/** Do: one quick action, such as Undo. */
export const DoOneQuickAction: Story = {
  name: 'Do: one quick action',
  render: () => <Sketch title="Moved to trash" action="Undo" />,
};
/** Don't: something people must act on, which can go before they reach it. */
export const DontMustAct: Story = {
  name: "Don't: something people must act on",
  render: () => <Sketch title="Your card was declined" description="Update your card by Friday to keep your plan." action="Update card" />,
};
