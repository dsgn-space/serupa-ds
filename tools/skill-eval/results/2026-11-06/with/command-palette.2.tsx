import { CommandPalette, Toaster, toast } from 'serupa-ds';

// NOTE: I couldn't open serupa-ds's CommandPalette README in this session, so
// the prop names below (`commands`, `id`, `label`, `icon`, `keywords`,
// `onSelect`) are my best reading of the API and are unchecked. Compare them
// with src/components/CommandPalette/README.md before using this.

const commands = [
  {
    id: 'new-file',
    label: 'New file',
    icon: 'note_add',
    keywords: ['create', 'add', 'document'],
    onSelect: () => toast('New file created'),
  },
  {
    id: 'open-settings',
    label: 'Open settings',
    icon: 'settings',
    keywords: ['preferences', 'options', 'configure'],
    onSelect: () => toast('Settings opened'),
  },
  {
    id: 'invite-people',
    label: 'Invite people',
    icon: 'person_add',
    keywords: ['team', 'share', 'members'],
    onSelect: () => toast('Invite sent'),
  },
  {
    id: 'sign-out',
    label: 'Sign out',
    icon: 'logout',
    keywords: ['log out', 'logout', 'exit'],
    onSelect: () => toast('Signed out'),
  },
];

export function AppCommandPalette() {
  return (
    <>
      {/* The palette opens on Ctrl+K (⌘K on Apple devices), filters as you type,
          moves with the arrow keys, and runs the picked command on Enter. */}
      <CommandPalette
        label="Command palette"
        placeholder="Type a command…"
        commands={commands}
      />
      {/* Confirmations disappear on their own and are announced to screen readers. */}
      <Toaster />
    </>
  );
}
