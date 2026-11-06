import { useMemo } from 'react';
import { CommandPalette, Toaster, toast } from 'serupa-ds';

export function AppCommandPalette() {
  const commands = useMemo(
    () => [
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
        onSelect: () => toast('Settings opened'),
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
    ],
    [],
  );

  // CommandPalette opens on Ctrl+K (⌘K on Apple devices) from anywhere,
  // filters as you type, moves with the arrow keys and runs on Enter.
  return (
    <>
      <CommandPalette
        label="Command palette"
        placeholder="Search actions…"
        commands={commands}
      />
      <Toaster />
    </>
  );
}
