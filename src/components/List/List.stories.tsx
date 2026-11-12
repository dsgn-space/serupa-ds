import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, ListItem, ListLoadingItems, type ListProps } from './List';
import { Alert } from '../Alert/Alert';
import { Button } from '../Button/Button';
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
        {(['loading', 'loaded', 'empty', 'failed'] as const).map((s) => <Button key={s} size="sm" variant={s === state ? 'primary' : 'secondary'} aria-pressed={s === state} onClick={() => setState(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>)}
      </div>
      {state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={() => setState('loading')}>Retry</Button>}>Members didn't load. Check your connection and try again.</Alert>
        : state === 'empty' ? <EmptyState size="sm" title="No members yet" description="Invite people to work on this project with you." />
        : state === 'loaded' ? <Members {...args} />
        : <List {...args} busy><ListLoadingItems rows={4} description leading="sm" label="Loading members" /></List>}
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
