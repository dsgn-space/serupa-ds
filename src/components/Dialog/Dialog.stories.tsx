import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, type DialogProps } from './Dialog';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Field } from '../Field/Field';

const meta = {
  title: 'Components/Overlays/Dialog',
  component: Dialog,
  args: { open: false, title: 'Invite people', description: 'They’ll get an email with a link.', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: function Render(args: DialogProps) {
    const [open, setOpen] = React.useState(false);
    return <>
      <Button onClick={() => setOpen(true)}>Invite people</Button>
      <Dialog {...args} open={open} onOpenChange={setOpen}
        footer={args.alert ? <><Button variant="secondary" onClick={() => setOpen(false)}>Keep</Button><Button destructive onClick={() => setOpen(false)}>Delete</Button></>
          : <><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Send invite</Button></>}>
        {args.alert ? null : <Field label="Email"><Input type="email" placeholder="name@company.com" /></Field>}
      </Dialog>
    </>;
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Confirmation: Story = { args: { alert: true, size: 'sm', title: 'Delete Atlas?', description: 'This removes the project and its files. It can’t be undone.' } };
export const Small: Story = { args: { size: 'sm', title: 'Rename project', description: undefined } };
export const Large: Story = { args: { size: 'lg', title: 'Share Atlas', description: 'Anyone you invite can view and comment.' } };
export const FullScreen: Story = { args: { fullScreen: true, title: 'Edit profile', description: 'Changes show on your public page.' } };
export const NoCloseButton: Story = { args: { closeButton: false, title: 'Invite people' } };
const TERMS = Array.from({ length: 24 }, (_, i) => <p key={i}>Section {i + 1}. You keep the rights to what you upload. We store it only to show it to the people you share it with, and delete it 30 days after you remove it.</p>);
/** A body taller than the screen with nothing focusable in it: Tab reaches the body, and the arrow keys scroll it. */
export const LongText: Story = {
  name: 'Long text',
  args: { title: 'Terms of use', description: undefined },
  render: function Render(args: DialogProps) {
    const [open, setOpen] = React.useState(false);
    return <>
      <Button onClick={() => setOpen(true)}>Read the terms</Button>
      <Dialog {...args} open={open} onOpenChange={setOpen} footer={<Button onClick={() => setOpen(false)}>Accept</Button>}>{TERMS}</Dialog>
    </>;
  },
};
/** `defaultOpen` without `open`: shown on arrival, and it closes itself (Escape, the ×, the backdrop or the button). */
export const OpenOnArrival: Story = {
  name: 'Open on arrival (defaultOpen)',
  args: { open: undefined, title: 'Welcome to Atlas', description: 'Your projects, files and team in one place.' },
  render: (args: DialogProps) => <Dialog {...args} defaultOpen footer={<Button onClick={(e) => (e.currentTarget.closest('dialog') as HTMLDialogElement).close()}>Get started</Button>} />,
};
/** `unsaved` once the name differs from the saved one: Escape, the × or the backdrop ask "Discard changes?" first. */
export const UnsavedChanges: Story = {
  name: 'Unsaved changes',
  args: { title: 'Rename project', description: undefined, size: 'sm' },
  render: function Render(args: DialogProps) {
    const [open, setOpen] = React.useState(false), [saved, setSaved] = React.useState('Atlas'), [name, setName] = React.useState('Atlas');
    const show = () => { setName(saved); setOpen(true); };
    return <>
      <Button onClick={show}>Rename {saved}</Button>
      <Dialog {...args} open={open} onOpenChange={setOpen} unsaved={name !== saved}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { setSaved(name); setOpen(false); }}>Save</Button></>}>
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      </Dialog>
    </>;
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't"). A modal dialog opens
// over the whole page, so these draw its panel in place, with the Dialog's own classes, to sit side by side.
function Sketch({ title, description, footer }: { title: string; description?: string; footer: React.ReactNode }) {
  return <div className="dk-dialog__panel" style={{ width: 360, boxShadow: 'none', border: '1px solid var(--border)' }}>
    <div className="dk-dialog__header"><div className="dk-dialog__heading"><h2 className="dk-dialog__title">{title}</h2>{description ? <p className="dk-dialog__description">{description}</p> : null}</div></div>
    <div className="dk-dialog__footer">{footer}</div>
  </div>;
}
/** Do: a title that asks the question, and buttons named for what they do. */
export const DoAskTheQuestion: Story = {
  name: 'Do: ask the question',
  render: () => <Sketch title="Delete Atlas?" description="This removes the project and its files. It can’t be undone." footer={<><Button variant="secondary">Keep project</Button><Button destructive>Delete project</Button></>} />,
};
/** Don't: "Are you sure?" with OK and Cancel, which say nothing about what happens. */
export const DontAreYouSure: Story = {
  name: "Don't: Are you sure?",
  render: () => <Sketch title="Are you sure?" description="This action can’t be undone." footer={<><Button variant="secondary">Cancel</Button><Button destructive>OK</Button></>} />,
};
/** Do: the main action last, at the end of the footer, where the eye ends. */
export const DoMainActionLast: Story = {
  name: 'Do: the main action last',
  render: () => <Sketch title="Invite people" description="They’ll get an email with a link." footer={<><Button variant="secondary">Cancel</Button><Button>Send invite</Button></>} />,
};
/** Don't: the main action first, so people read past it to the way out. */
export const DontMainActionFirst: Story = {
  name: "Don't: the main action first",
  render: () => <Sketch title="Invite people" description="They’ll get an email with a link." footer={<><Button>Send invite</Button><Button variant="secondary">Cancel</Button></>} />,
};
