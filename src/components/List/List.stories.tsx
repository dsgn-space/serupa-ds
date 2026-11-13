import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, ListItem, ListLoadingItems, ListSelectAll, type ListProps } from './List';
import { Stack } from '../Stack/Stack';
import { Alert } from '../Alert/Alert';
import { Button } from '../Button/Button';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { EmptyState } from '../EmptyState/EmptyState';
import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { IconButton } from '../IconButton/IconButton';
import { Text } from '../Text/Text';
import { usePeople } from '../../../.storybook/content';

// The people come from the Content menu in the toolbar (demo, worst case, empty, one), so the same story can be
// checked with a long name, a missing email or role, right-to-left text, and no one at all.
function Members({ links, ...args }: ListProps & { links?: boolean }) {
  const people = usePeople();
  if (!people.length) return <Text tone="muted">No members yet</Text>;
  return (
    <List {...args}>
      {people.map((p, i) => links
        ? <ListItem key={p.name} href="#" selected={i === 0} leading={<Avatar name={p.name} alt="" size="sm" />} title={p.name} description={p.email}
            trailing={<IconButton icon="more_horiz" label={`More for ${p.name}`} size="sm" />} />
        : <ListItem key={p.name} leading={<Avatar name={p.name} alt="" size="sm" />} title={p.name} description={p.email} trailing={p.role ? <Badge>{p.role}</Badge> : undefined} />)}
    </List>
  );
}

const meta = {
  title: 'Components/Content/List',
  component: List,
  subcomponents: { ListItem },
  args: { 'aria-label': 'Members' },
  argTypes: { variant: { control: 'inline-radio', options: ['plain', 'card'] }, children: { control: false } },
  render: (args) => <div style={{ maxWidth: 480 }}><List {...args} /></div>,
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <div style={{ maxWidth: 480 }}><Members {...args} /></div>,
};

export const Links: Story = {
  args: { variant: 'card' },
  render: (args) => <div style={{ maxWidth: 480 }}><Members {...args} links /></div>,
};

export const Files: Story = {
  args: {
    'aria-label': 'Files',
    children: [
      <ListItem key="a" leading="description" title="Quarterly report.pdf" description="2.4 MB" trailing="Yesterday" />,
      <ListItem key="b" leading="image" title="Logo.png" description="320 KB" trailing="Mar 3" />,
      <ListItem key="c" leading="folder" title="Archive" description="12 files" trailing="Feb 18" />,
    ],
  },
};

export const Settings: Story = {
  args: {
    variant: 'card', 'aria-label': 'Settings',
    children: [
      <ListItem key="a" leading="person" title="Profile" description="Name, photo and email" onClick={() => {}} trailing="›" />,
      <ListItem key="b" leading="notifications" title="Notifications" description="Email and push" onClick={() => {}} />,
      <ListItem key="c" leading="lock" title="Security" description="Password and two-step sign-in" disabled href="#" />,
    ],
  },
};

export const LongText: Story = {
  args: {
    children: [
      <ListItem key="a" leading={<Avatar name="Maria Magdalena von Hohenzollern" alt="" size="sm" />} title="Maria Magdalena von Hohenzollern-Sigmaringen" description="maria.magdalena.hohenzollern@example.com" trailing={<Badge>Administrator</Badge>} />,
      <ListItem key="b" leading={<Avatar name="Grace Hopper" alt="" size="sm" />} title="Donaudampfschifffahrtsgesellschaftskapitänskajüte" description="no-place-to-break@Donaudampfschifffahrtsgesellschaftskapitänskajüte.example" trailing={<Badge>Editor</Badge>} />,
    ],
  },
  render: (args) => <div style={{ width: 260 }}><List {...args} /></div>,
};

// Loading, empty and failed: the placeholders have the rows' shape, and a failure offers Retry.
function States(args: ListProps) {
  const [state, setState] = React.useState<'loading' | 'loaded' | 'empty' | 'failed'>('loading');
  return (
    <div style={{ maxWidth: 480, display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <SegmentedControl aria-label="State" size="sm" value={state} onValueChange={setState} options={(['loading', 'loaded', 'empty', 'failed'] as const).map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
      </div>
      {state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={() => setState('loading')}>Retry</Button>}>Members didn't load. Check your connection and try again.</Alert>
        : state === 'empty' ? <EmptyState size="sm" title="No members yet" description="Invite people to work on this project with you." />
        : state === 'loaded' ? <Members {...args} />
        : <List {...args} loading><ListLoadingItems rows={4} description leading="sm" label="Loading members" /></List>}
    </div>
  );
}
export const LoadingAndErrors: Story = { name: 'Loading, empty and failed', render: (args) => <States {...args} /> };

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: a short title, with the detail in the description and the status at the end. */
export const DoTitleAndDetail: Story = {
  name: 'Do: keep the title short',
  args: { children: [
    <ListItem key="a" leading="person" title="Ana Ruiz" description="ana@example.com" trailing={<Badge>Admin</Badge>} />,
    <ListItem key="b" leading="person" title="Kenji Mori" description="kenji@example.com" trailing={<Badge>Editor</Badge>} />,
  ] },
};
/** Don't: everything in the title, so it wraps and the names stop lining up. */
export const DontCrammedTitle: Story = {
  name: "Don't: cram everything into the title",
  args: { children: [
    <ListItem key="a" leading="person" title="Ana Ruiz, ana@example.com, Admin since March" />,
    <ListItem key="b" leading="person" title="Kenji Mori, kenji@example.com, Editor since June" />,
  ] },
};

const files = [
  { id: 'budget', name: 'Budget 2027.xlsx', size: '48 KB', icon: 'table_chart' },
  { id: 'notes', name: 'Meeting notes.md', size: '6 KB', icon: 'description' },
  { id: 'photo', name: 'Team photo.jpg', size: '2.4 MB', icon: 'image' },
  { id: 'plan', name: 'Launch plan.pdf', size: '310 KB', icon: 'picture_as_pdf' },
];
function PickFiles({ start = ['notes', 'photo'], single = false }: { start?: string[]; single?: boolean }) {
  const [picked, setPicked] = React.useState<string[]>(start);
  return (
    <div style={{ maxWidth: 480 }}>
      {single ? null : (
        <Stack direction="row" gap={3} align="center" className="mb-2">
          <ListSelectAll values={files.map((f) => f.id)} selected={picked} onSelectedChange={setPicked} />
          <Text tone="muted" size="sm">{picked.length} selected</Text>
        </Stack>
      )}
      <List aria-label="Files" variant="card" selectionMode={single ? 'single' : 'multiple'} selected={picked} onSelectedChange={setPicked}>
        {files.map((f) => <ListItem key={f.id} value={f.id} leading={f.icon} title={f.name} description={f.size}
          trailing={<IconButton icon="more_vert" label={`More for ${f.name}`} size="sm" />} />)}
      </List>
    </div>
  );
}
/** Files picked to act on: a checkbox per row, Select all above. Tab to the list, Up and Down between rows, Space picks, Shift+Down picks a run, Ctrl+A picks all. */
export const Selectable: Story = { name: 'Picking rows', render: () => <PickFiles /> };
/** One row at a time, with no checkboxes: the picked row has the primary bar. */
export const SelectableSingle: Story = { name: 'Picking one row', render: () => <PickFiles single start={['photo']} /> };
