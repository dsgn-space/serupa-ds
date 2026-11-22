import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandPalette, type Command, type CommandPaletteProps } from './CommandPalette';
import { Button } from '../Button/Button';
import { Kbd } from '../Kbd/Kbd';

const COMMANDS: Command[] = [
  { id: 'home', label: 'Home', group: 'Pages', icon: 'home' },
  { id: 'projects', label: 'Projects', group: 'Pages', icon: 'folder' },
  { id: 'settings', label: 'Settings', group: 'Pages', icon: 'settings', description: 'Profile, notifications and appearance', keywords: ['preferences', 'account'] },
  { id: 'new', label: 'New project', group: 'Actions', icon: 'add', shortcut: ['mod', 'N'] },
  { id: 'invite', label: 'Invite people', group: 'Actions', icon: 'person_add' },
  { id: 'theme', label: 'Switch to dark theme', group: 'Actions', icon: 'dark_mode', shortcut: ['mod', 'shift', 'L'] },
  { id: 'export', label: 'Export as PDF', group: 'Actions', icon: 'download', disabled: true },
];

const meta = {
  title: 'Components/Overlays/CommandPalette',
  component: CommandPalette,
  args: { commands: COMMANDS },
  render: function Render(args: CommandPaletteProps) {
    const [open, setOpen] = React.useState(!!args.defaultOpen);
    const [ran, setRan] = React.useState('Nothing yet.');
    return <>
      <p>Press <Kbd keys={['mod', 'K']} /> anywhere, or the button. Last chosen: {ran}</p>
      <Button variant="outline" onClick={() => setOpen(true)}>Search commands</Button>
      <CommandPalette {...args} open={open} onOpenChange={setOpen} onSelect={(c) => setRan(c.label)} />
    </>;
  },
} satisfies Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
// Open, before anything is typed: every command, by group, the first one active.
export const Default: Story = { args: { defaultOpen: true } };
// No groups: one list under "Commands".
export const Ungrouped: Story = { args: { defaultOpen: true, commands: COMMANDS.map(({ group: _g, ...c }) => c) } };
// Searching a server: filter={false} lists what the search found, and loading shows a row until it comes back.
// Type "inv" or "1042": the answer takes half a second.
const RECORDS: Command[] = [
  { id: 'i1042', label: 'Invoice 1042, Acme Corp', group: 'Invoices', icon: 'receipt' },
  { id: 'i1043', label: 'Invoice 1043, Globex', group: 'Invoices', icon: 'receipt' },
  { id: 'r1042', label: 'Refund for invoice 1042', group: 'Refunds', icon: 'undo' },
];
export const ServerSearch: Story = {
  render: function Render(args: CommandPaletteProps) {
    const [open, setOpen] = React.useState(true);
    const [query, setQuery] = React.useState('');
    const [found, setFound] = React.useState<Command[]>([]);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
      const q = query.trim().toLowerCase();
      if (!q) { setFound([]); setLoading(false); return; }
      setLoading(true);
      const t = setTimeout(() => { setFound(RECORDS.filter((r) => r.label.toLowerCase().includes(q))); setLoading(false); }, 500);
      return () => clearTimeout(t);
    }, [query]);
    return <>
      <Button variant="outline" onClick={() => setOpen(true)}>Search records</Button>
      <CommandPalette {...args} open={open} onOpenChange={setOpen} placeholder="Search invoices and refunds" filter={false}
        commands={query.trim() ? found : COMMANDS} loading={loading} onQueryChange={setQuery} />
    </>;
  },
};
// Loading before anything is listed, as the first answer comes back.
export const Loading: Story = { args: { defaultOpen: true, commands: [], filter: false, loading: true } };
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: {
    defaultOpen: true,
    commands: [
      { id: 'long', label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung', group: 'A group name long enough to wrap twice in a narrow column', shortcut: ['mod', 'shift', 'alt', 'K'] },
      ...Array.from({ length: 30 }, (_, i) => ({ id: 'p' + i, label: 'Project number ' + (i + 1), group: 'Projects' })),
    ],
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: labels that start with the word people type ("New project"). */
export const DoActionFirst: Story = {
  name: 'Do: start with the word people type',
  args: { defaultOpen: true, commands: [
    { id: 'new', label: 'New project', group: 'Actions', icon: 'add' },
    { id: 'invite', label: 'Invite people', group: 'Actions', icon: 'person_add' },
    { id: 'export', label: 'Export as PDF', group: 'Actions', icon: 'download' },
  ] },
};
/** Don't: wordy labels, which take longer to type toward and to scan. */
export const DontWordyLabels: Story = { tags: ['!visual'],
  name: "Don't: write wordy labels",
  args: { defaultOpen: true, commands: [
    { id: 'new', label: 'Click here to create a brand new project', group: 'Actions', icon: 'add' },
    { id: 'invite', label: 'Use this to invite more people to the workspace', group: 'Actions', icon: 'person_add' },
    { id: 'export', label: 'This exports the current page as a PDF file', group: 'Actions', icon: 'download' },
  ] },
};
