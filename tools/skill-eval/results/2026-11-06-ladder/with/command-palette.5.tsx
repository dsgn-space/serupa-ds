import { useEffect, useState } from 'react';
import { CommandPalette, toast } from 'serupa-ds';

type Action = {
  id: string;
  label: string;
  icon: string;
  run: () => void;
};

const actions: Action[] = [
  { id: 'new-file', label: 'New file', icon: 'note_add', run: () => toast('New file created') },
  { id: 'settings', label: 'Open settings', icon: 'settings', run: () => toast('Settings opened') },
  { id: 'invite', label: 'Invite people', icon: 'person_add', run: () => toast('Invite dialog opened') },
  { id: 'sign-out', label: 'Sign out', icon: 'logout', run: () => toast('Signed out') },
];

export function AppCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      placeholder="Type a command…"
      emptyText="No matching commands"
      commands={actions.map((a) => ({
        id: a.id,
        label: a.label,
        icon: a.icon,
        onSelect: () => {
          setOpen(false);
          a.run();
        },
      }))}
    />
  );
}
