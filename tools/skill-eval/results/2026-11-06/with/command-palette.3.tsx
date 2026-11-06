import { CommandPalette, toast, Toaster } from 'serupa-ds';

// NOTE: I couldn't open the CommandPalette README in this session, so the props
// below (`commands`, `id`, `label`, `icon`, `onSelect`) are my best guess.
// Check them against src/components/CommandPalette/README.md before shipping.
const commands = [
  {
    id: 'new-file',
    label: 'New file',
    icon: 'note_add',
    onSelect: () => toast('New file created'),
  },
  {
    id: 'open-settings',
    label: 'Open settings',
    icon: 'settings',
    onSelect: () => toast('Opening settings'),
  },
  {
    id: 'invite-people',
    label: 'Invite people',
    icon: 'person_add',
    onSelect: () => toast('Invite link ready'),
  },
  {
    id: 'sign-out',
    label: 'Sign out',
    icon: 'logout',
    onSelect: () => toast('Signed out'),
  },
];

export function AppCommandPalette() {
  return (
    <>
      {/* CommandPalette opens with Ctrl+K (⌘K on Apple devices) from anywhere,
          filters as you type, moves with the arrow keys and runs on Enter. */}
      <CommandPalette commands={commands} />
      {/* Render one Toaster near the app root if the app doesn't have one yet. */}
      <Toaster />
    </>
  );
}
