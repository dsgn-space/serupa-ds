import { useState } from 'react';
import { CommandPalette, toast, Toaster } from 'serupa-ds';

// Assumes the CommandPalette API: `commands` (id, label, icon, keywords, onSelect),
// controlled `open` / `onOpenChange`, and a built-in Ctrl+K / ⌘K shortcut.
// I couldn't open the component's README here, so check these prop names against
// src/components/CommandPalette/README.md.
export function AppCommandPalette() {
  const [open, setOpen] = useState(false);

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
      keywords: ['preferences', 'options', 'config'],
      onSelect: () => toast('Opening settings'),
    },
    {
      id: 'invite-people',
      label: 'Invite people',
      icon: 'person_add',
      keywords: ['share', 'team', 'member'],
      onSelect: () => toast('Invite sent'),
    },
    {
      id: 'sign-out',
      label: 'Sign out',
      icon: 'logout',
      keywords: ['log out', 'exit'],
      onSelect: () => toast('Signed out'),
    },
  ];

  return (
    <>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        placeholder="Type a command…"
        commands={commands}
      />
      <Toaster />
    </>
  );
}
