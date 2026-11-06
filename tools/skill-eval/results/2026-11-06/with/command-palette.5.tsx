import { useState } from 'react';
import { CommandPalette, Toaster, toast } from 'serupa-ds';

type Action = {
  id: string;
  label: string;
  icon: string;
  keywords?: string[];
  run: () => void;
};

export function AppCommandPalette() {
  const [open, setOpen] = useState(false);

  const actions: Action[] = [
    {
      id: 'new-file',
      label: 'New file',
      icon: 'note_add',
      keywords: ['create', 'document'],
      run: () => toast('New file created'),
    },
    {
      id: 'open-settings',
      label: 'Open settings',
      icon: 'settings',
      keywords: ['preferences', 'options'],
      run: () => toast('Settings opened'),
    },
    {
      id: 'invite-people',
      label: 'Invite people',
      icon: 'person_add',
      keywords: ['team', 'share', 'member'],
      run: () => toast('Invite link ready to share'),
    },
    {
      id: 'sign-out',
      label: 'Sign out',
      icon: 'logout',
      keywords: ['log out', 'exit'],
      run: () => toast('Signed out'),
    },
  ];

  return (
    <>
      {/* Opens with Ctrl+K (⌘K on Apple devices) from anywhere on the page. */}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        placeholder="Type a command…"
        emptyLabel="No matching commands"
        commands={actions.map((action) => ({
          id: action.id,
          label: action.label,
          icon: action.icon,
          keywords: action.keywords,
          onSelect: () => {
            setOpen(false);
            action.run();
          },
        }))}
      />
      <Toaster />
    </>
  );
}
