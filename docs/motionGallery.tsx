// The Motion foundation's "In practice" gallery: each common transition in the library as a live component, with what
// it explains, how often people see it and the roles it runs on, so a reader can feel the rules rather than read them.
import * as React from 'react';
import { Accordion, AccordionItem } from '../src/components/Accordion/Accordion';
import { Button } from '../src/components/Button/Button';
import { CopyButton } from '../src/components/CopyButton/CopyButton';
import { Dialog } from '../src/components/Dialog/Dialog';
import { Drawer } from '../src/components/Drawer/Drawer';
import { Menu, MenuItem } from '../src/components/Menu/Menu';
import { SegmentedControl } from '../src/components/SegmentedControl/SegmentedControl';
import { Switch } from '../src/components/Switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../src/components/Tabs/Tabs';
import { toast, Toaster } from '../src/components/Toast/Toast';
import { Tooltip } from '../src/components/Tooltip/Tooltip';

interface Entry {
  name: string;
  /** What the motion explains, in one line. */
  why: string;
  /** The row of the Motion foundation's "How often" table it sits in. */
  often: 'Hundreds of times a day' | 'Many times a session' | 'Now and then';
  /** The roles and easings it runs on, enter first. */
  roles: string;
  demo: React.ReactNode;
}

function DialogDemo() {
  const [open, setOpen] = React.useState(false);
  return <>
    <Button variant="secondary" onClick={() => setOpen(true)}>Open dialog</Button>
    <Dialog open={open} onOpenChange={setOpen} title="Rename project" footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
      It grows a little as it fades in, and leaves faster than it came.
    </Dialog>
  </>;
}

function DrawerDemo() {
  const [open, setOpen] = React.useState(false);
  return <>
    <Button variant="secondary" onClick={() => setOpen(true)}>Open drawer</Button>
    <Drawer open={open} onOpenChange={setOpen} title="Filters" footer={<Button onClick={() => setOpen(false)}>Apply</Button>}>
      It slides in from the edge it belongs to, so it's clear where it went when it closes.
    </Drawer>
  </>;
}

const ENTRIES: Entry[] = [
  { name: 'Switch and Checkbox press', why: 'The hand was felt: the control gives a little while held and springs back.', often: 'Hundreds of times a day',
    roles: 'motion-press, ease-move; motion-release, ease-spring', demo: <Switch defaultChecked>Email me updates</Switch> },
  { name: 'Tooltip', why: 'A hint that waits a beat before showing, then leaves at once so it never covers the next thing.', often: 'Hundreds of times a day',
    roles: 'motion-enter-sm, ease-enter; motion-exit-sm, ease-exit', demo: <Tooltip content="Download as PDF"><Button variant="secondary">Hover or focus me</Button></Tooltip> },
  { name: 'Menu', why: 'Where it came from: it grows out of its button, from the side it opens on.', often: 'Many times a session',
    roles: 'motion-enter-sm, ease-enter; motion-exit-sm, ease-exit',
    demo: <Menu trigger={<Button variant="secondary" rightIcon="expand_more">Sort</Button>}><MenuItem>Name</MenuItem><MenuItem>Date modified</MenuItem><MenuItem>Size</MenuItem></Menu> },
  { name: 'Tabs and SegmentedControl indicator', why: 'Two states joined: the indicator slides to the new choice instead of jumping.', often: 'Many times a session',
    roles: 'motion-change-sm, ease-move',
    demo: <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
      <SegmentedControl aria-label="Period" defaultValue="week" options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
      <Tabs defaultValue="a" variant="pill"><TabList aria-label="Section"><Tab value="a">Overview</Tab><Tab value="b">Activity</Tab><Tab value="c">Members</Tab></TabList>
        <TabPanel value="a">Overview</TabPanel><TabPanel value="b">Activity</TabPanel><TabPanel value="c">Members</TabPanel></Tabs>
    </div> },
  { name: 'CopyButton', why: 'One thing changing in place: the icon and label swap through a short blur, so it reads as the same button.', often: 'Many times a session',
    roles: 'motion-change-sm, ease-enter', demo: <CopyButton value="npm i serupa-ds">Copy the command</CopyButton> },
  { name: 'Accordion', why: 'A panel opening joins the closed and open states; the chevron turns with it.', often: 'Many times a session',
    roles: 'motion-enter-md, ease-enter; motion-exit-md, ease-exit',
    demo: <div style={{ inlineSize: 'var(--sizing-full)' }}><Accordion><AccordionItem value="a" title="Is there a warranty?">One year against defects.</AccordionItem></Accordion></div> },
  { name: 'Dialog', why: 'Something new and important arrived, above the page.', often: 'Now and then',
    roles: 'motion-enter-md, ease-enter; motion-exit-md, ease-exit', demo: <DialogDemo /> },
  { name: 'Drawer', why: 'Where it came from and where it goes back to: its own edge.', often: 'Now and then',
    roles: 'motion-enter-lg, ease-enter; motion-exit-lg, ease-exit', demo: <DrawerDemo /> },
  { name: 'Toast', why: 'Something finished: it rises into the stack, and the stack makes room as fast as it comes.', often: 'Now and then',
    roles: 'motion-enter-md, ease-enter; motion-exit-md, ease-exit',
    demo: <Button variant="secondary" onClick={() => toast({ title: 'Changes saved', tone: 'success' })}>Show a toast</Button> },
];

/** Every entry as a card: the live component, then what it explains, how often it's seen, and its roles. */
export function MotionGallery() {
  return <>
    <Toaster />
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--spacing-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))' }}>
      {ENTRIES.map((e) => (
        <li key={e.name} style={{ minInlineSize: 0, display: 'grid', gap: 'var(--spacing-3)', alignContent: 'start', padding: 'var(--spacing-4)', border: 'var(--border-width-1) solid var(--border)', borderRadius: 'var(--rounded-lg)', background: 'var(--surface)' }}>
          <div style={{ minBlockSize: 'var(--spacing-20)', display: 'flex', alignItems: 'center' }}>{e.demo}</div>
          <strong>{e.name}</strong>
          <span>{e.why}</span>
          <span style={{ color: 'var(--text-muted)' }}>{e.often}</span>
          <code style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{e.roles}</code>
        </li>
      ))}
    </ul>
  </>;
}
