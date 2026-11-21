import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer, type DrawerProps } from './Drawer';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Field } from '../Field/Field';
import { Checkbox } from '../Checkbox/Checkbox';

const stack = { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' } as const;
const CONTENT: Record<string, { trigger: string; body: React.ReactNode; footer?: (close: () => void) => React.ReactNode }> = {
  Filters: {
    trigger: 'Open filters',
    body: <div style={stack}><Field label="Name"><Input placeholder="Search projects" /></Field><Checkbox>Only mine</Checkbox><Checkbox>Include archived</Checkbox></div>,
    footer: (close) => <><Button variant="secondary" onClick={close}>Reset</Button><Button onClick={close}>Apply</Button></>,
  },
  Menu: {
    trigger: 'Menu',
    body: <nav aria-label="Main"><ul style={{ ...stack, margin: 0, padding: 0, listStyle: 'none' }}><li><a href="#home">Home</a></li><li><a href="#projects">Projects</a></li><li><a href="#settings">Settings</a></li></ul></nav>,
  },
  Share: {
    trigger: 'Share',
    body: <Field label="Link"><Input readOnly defaultValue="https://acme.example/d/atlas" /></Field>,
    footer: (close) => <Button onClick={close}>Done</Button>,
  },
  Nearby: {
    trigger: 'Cafés nearby',
    body: <div style={stack}><p style={{ margin: 0 }}>Kopi Kenangan, 3 minutes</p><p style={{ margin: 0 }}>Tanamera, 6 minutes</p><p style={{ margin: 0 }}>Anomali, 9 minutes</p></div>,
  },
  Announcements: {
    trigger: 'What’s new',
    body: <div style={stack}><p style={{ margin: 0 }}>Search now finds archived projects.</p><p style={{ margin: 0 }}>Exports include comments.</p></div>,
  },
  'Project details': {
    trigger: 'Project details',
    body: <div style={stack}><p style={{ margin: 0 }}>Atlas is the new customer portal, due on 28 November.</p><p style={{ margin: 0 }}>Owner: Dewi Lestari. 12 people, 48 tasks, 9 open.</p></div>,
    footer: (close) => <Button onClick={close}>Open project</Button>,
  },
};
CONTENT['Unsaved filters'] = CONTENT.Filters!;

const meta = {
  title: 'Components/Overlays/Drawer',
  component: Drawer,
  args: { open: false, title: 'Filters', description: 'Narrow the list of projects.', placement: 'right', size: 'md' },
  argTypes: { placement: { control: 'inline-radio', options: ['right', 'left', 'top', 'bottom', 'start', 'end'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  // Open in its own canvas, so each size, placement and long story is in a picture; closed on the docs page, so it
  // doesn't cover the guide.
  render: (args: DrawerProps, ctx: { viewMode?: string }) => <DemoDrawer {...args} initiallyOpen={ctx.viewMode !== 'docs'} />,
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

function DemoDrawer({ initiallyOpen, ...args }: DrawerProps & { initiallyOpen: boolean }) {
  const [open, setOpen] = React.useState(initiallyOpen);
  // Each placement's story opens a drawer that fits its title, from a button that says what it opens: a share sheet
  // with a link, not the filters under "Share".
  const { trigger, body, footer } = (typeof args.title === 'string' && CONTENT[args.title]) || CONTENT.Filters!;
  const close = () => setOpen(false);
  return <>
    <Button onClick={() => setOpen(true)}>{trigger}</Button>
    <Drawer {...args} open={open} onOpenChange={setOpen} footer={footer?.(close)}>{body}</Drawer>
  </>;
}

/** Closed, as a page starts: the trigger, ready to open it. */
export const Playground: Story = { render: (args: DrawerProps) => <DemoDrawer {...args} initiallyOpen={false} /> };
export const Left: Story = { args: { placement: 'left', size: 'sm', title: 'Menu', description: undefined } };
export const Bottom: Story = { args: { placement: 'bottom', title: 'Share', description: 'Anyone with the link can view.' } };
// A sheet that stops at 40% and 90% of the screen: pull it up by its handle or header, or press the handle.
export const BottomSheet: Story = { args: { placement: 'bottom', title: 'Nearby', description: 'Cafés within a 10-minute walk.', snapPoints: [0.4, 0.9] } };
export const Top: Story = { args: { placement: 'top', size: 'sm', title: 'Announcements', description: 'What changed this week.' } };
export const Small: Story = { args: { size: 'sm', title: 'Filters' } };
export const Large: Story = { args: { size: 'lg', title: 'Project details', description: 'Everything about Atlas in one place.' } };
export const NoCloseButton: Story = { args: { closeButton: false, title: 'Filters' } };
export const StaysOpenOnBackdropPress: Story = { name: 'Stays open on a backdrop press', args: { closeOnBackdrop: false, title: 'Unsaved filters', description: 'Apply or reset them to close.' } };
const NOTES = Array.from({ length: 24 }, (_, i) => <p key={i}>Release {24 - i}. Faster search, a new export menu, and fixes for the calendar in right-to-left pages.</p>);
/** A body taller than the screen with nothing focusable in it: Tab reaches the body, and the arrow keys scroll it. */
export const LongText: Story = {
  name: 'Long text',
  args: { title: 'Release notes', description: undefined },
  render: function Render(args: DrawerProps, ctx: { viewMode?: string }) {
    const [open, setOpen] = React.useState(ctx.viewMode !== 'docs');
    return <>
      <Button onClick={() => setOpen(true)}>Release notes</Button>
      <Drawer {...args} open={open} onOpenChange={setOpen}>{NOTES}</Drawer>
    </>;
  },
};

export const UnsavedChanges: Story = {
  name: 'Unsaved changes',
  args: { title: 'Edit project', description: undefined },
  render: function Render(args: DrawerProps, ctx: { viewMode?: string }) {
    const [open, setOpen] = React.useState(ctx.viewMode !== 'docs'), [saved, setSaved] = React.useState('Atlas'), [name, setName] = React.useState('Atlas');
    const show = () => { setName(saved); setOpen(true); };
    return <>
      <Button onClick={show}>Edit {saved}</Button>
      <Drawer {...args} open={open} onOpenChange={setOpen} unsaved={name !== saved}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { setSaved(name); setOpen(false); }}>Save</Button></>}>
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      </Drawer>
    </>;
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
// Open in its own canvas for the pictures; closed on the docs page, so it doesn't cover the guide.
function OpenDrawer(props: DrawerProps & { docs: boolean }) {
  const { docs, ...args } = props;
  const [open, setOpen] = React.useState(!docs);
  return <><Button onClick={() => setOpen(true)}>Open filters</Button><Drawer {...args} open={open} onOpenChange={setOpen} /></>;
}
const filters = <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}><Field label="Name"><Input placeholder="Search projects" /></Field><Checkbox>Only mine</Checkbox></div>;
/** Do: the actions in \`footer\`, where they stay in view, with the main action last. */
export const DoFooterActions: Story = {
  name: 'Do: put the actions in the footer',
  render: (args, ctx) => <OpenDrawer {...args} docs={ctx.viewMode === 'docs'} footer={<><Button variant="secondary">Reset</Button><Button>Apply</Button></>}>{filters}</OpenDrawer>,
};
/** Don't: the actions in the body, main action first, where they scroll away with the content. */
export const DontBodyActions: Story = {
  name: "Don't: bury the actions in the body",
  render: (args, ctx) => <OpenDrawer {...args} docs={ctx.viewMode === 'docs'}>{filters}<div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}><Button>Apply</Button><Button variant="secondary">Reset</Button></div></OpenDrawer>,
};
