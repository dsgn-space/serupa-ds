import { CommandPalette, Toaster, toast } from 'serupa-ds';
import type { ReactNode } from 'react';

type Action = {
  id: string;
  label: string;
  keywords?: string[];
  onSelect: () => void;
};

const actions: Action[] = [
  {
    id: 'new-file',
    label: 'New file',
    keywords: ['create', 'add'],
    onSelect: () => toast('New file created'),
  },
  {
    id: 'open-settings',
    label: 'Open settings',
    keywords: ['preferences', 'config'],
    onSelect: () => toast('Settings opened'),
  },
  {
    id: 'invite-people',
    label: 'Invite people',
    keywords: ['share', 'team', 'member'],
    onSelect: () => toast('Invite sent'),
  },
  {
    id: 'sign-out',
    label: 'Sign out',
    keywords: ['log out', 'logout'],
    onSelect: () => toast('Signed out'),
  },
];

/**
 * Press Ctrl+K (⌘K on Apple devices) anywhere to open the palette.
 * Type to filter, use the arrow keys to move, Enter runs the action.
 * Render once near the app's root, together with the single <Toaster />.
 */
export function AppCommandPalette(): ReactNode {
  return (
    <>
      <CommandPalette
        label="Command palette"
        placeholder="Search actions…"
        emptyLabel="No matching actions"
        commands={actions}
      />
      <Toaster />
    </>
  );
}

export default AppCommandPalette;
