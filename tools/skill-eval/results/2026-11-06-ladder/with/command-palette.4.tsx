import { useMemo, useState } from 'react';
import { CommandPalette, Icon, toast } from 'serupa-ds';

type Action = {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  run: () => void;
};

export function AppCommandPalette() {
  const [open, setOpen] = useState(false);

  const actions = useMemo<Action[]>(
    () => [
      {
        id: 'new-file',
        label: 'New file',
        icon: 'note_add',
        keywords: ['create', 'add', 'document'],
        run: () => toast('New file created'),
      },
      {
        id: 'open-settings',
        label: 'Open settings',
        icon: 'settings',
        keywords: ['preferences', 'options', 'configure'],
        run: () => toast('Opening settings'),
      },
      {
        id: 'invite-people',
        label: 'Invite people',
        icon: 'person_add',
        keywords: ['team', 'share', 'member', 'add user'],
        run: () => toast('Invite link ready'),
      },
      {
        id: 'sign-out',
        label: 'Sign out',
        icon: 'logout',
        keywords: ['log out', 'exit', 'leave'],
        run: () => toast('Signed out'),
      },
    ],
    [],
  );

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      shortcut="mod+k" /* Ctrl+K, or ⌘K on Apple devices */
      label="Command palette"
      placeholder="Search actions…"
      emptyMessage="No matching actions"
      commands={actions.map((action) => ({
        id: action.id,
        label: action.label,
        keywords: action.keywords,
        icon: <Icon name={action.icon} />,
        onSelect: () => {
          setOpen(false);
          action.run();
        },
      }))}
    />
  );
}
