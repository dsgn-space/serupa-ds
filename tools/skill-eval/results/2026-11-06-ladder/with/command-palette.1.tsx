import { useState } from 'react';
import { CommandPalette, Icon, toast } from 'serupa-ds';

type Action = {
  id: string;
  label: string;
  icon: string;
  keywords?: string[];
  run: () => void;
};

export function AppCommandPalette({ onSignOut }: { onSignOut: () => void }) {
  const [open, setOpen] = useState(false);

  const actions: Action[] = [
    {
      id: 'new-file',
      label: 'New file',
      icon: 'note_add',
      keywords: ['create', 'add'],
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
      run: () => toast('Invite link ready'),
    },
    {
      id: 'sign-out',
      label: 'Sign out',
      icon: 'logout',
      keywords: ['log out', 'exit'],
      run: onSignOut,
    },
  ];

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      placeholder="Type a command…"
      emptyLabel="No matching commands"
      commands={actions.map((a) => ({
        id: a.id,
        label: a.label,
        keywords: a.keywords,
        icon: <Icon name={a.icon} />,
        onSelect: () => {
          setOpen(false);
          a.run();
        },
      }))}
    />
  );
}
