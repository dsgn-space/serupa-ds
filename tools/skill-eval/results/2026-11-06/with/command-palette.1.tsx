import { CommandPalette, Icon, toast } from 'serupa-ds';

const commands = [
  {
    id: 'new-file',
    label: 'New file',
    icon: <Icon name="note_add" />,
    keywords: ['create', 'add', 'document'],
    onSelect: () => toast('New file created'),
  },
  {
    id: 'open-settings',
    label: 'Open settings',
    icon: <Icon name="settings" />,
    keywords: ['preferences', 'options', 'configure'],
    onSelect: () => toast('Settings opened'),
  },
  {
    id: 'invite-people',
    label: 'Invite people',
    icon: <Icon name="person_add" />,
    keywords: ['team', 'share', 'member'],
    onSelect: () => toast('Invite sent'),
  },
  {
    id: 'sign-out',
    label: 'Sign out',
    icon: <Icon name="logout" />,
    keywords: ['log out', 'exit'],
    onSelect: () => toast('Signed out'),
  },
];

export function AppCommandPalette() {
  // CommandPalette listens for Ctrl+K (⌘K on Apple devices) on its own,
  // filters the list as you type, and runs onSelect on Enter or click.
  return (
    <CommandPalette
      label="Command palette"
      placeholder="Type a command…"
      emptyLabel="No matching commands"
      items={commands}
    />
  );
}
