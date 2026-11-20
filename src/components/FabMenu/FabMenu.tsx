'use client';
import * as React from 'react';
import type { IconSource } from '../Icon/Icon';
import { oneOf } from '../../internal/cn';
import { named } from '../../internal/component';
import { Fab, type FabPosition, type FabProps } from '../Fab/Fab';
import { Menu, MenuItem } from '../Menu/Menu';

/** One of a FabMenu's actions: its words (always shown), an icon, and what it does. */
export interface FabMenuAction {
  /** The action's words, shown in the menu: "New folder". */
  label: string;
  /** An icon before the words: a Material Symbols name or any element. */
  icon?: IconSource | undefined;
  /** Called when it's picked (a press, Enter or Space); the menu then closes. */
  onSelect: () => void;
  /** Still reachable with the keys, but can't be picked. */
  disabled?: boolean | undefined;
  /** Danger colors, for deleting. */
  destructive?: boolean | undefined;
}

export interface FabMenuProps extends Omit<FabProps, 'onClick'> {
  /** The actions the button opens, 3 to 6, each with its words shown: "New document", "New folder", "Upload". */
  actions: readonly FabMenuAction[];
  /** Open it yourself (controlled), with onOpenChange. */
  open?: boolean | undefined;
  /** Called when it opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

const POSITIONS: readonly FabPosition[] = ['bottom-end', 'bottom-start', 'top-end', 'top-start', 'static'];

/* FabMenu: a Fab that opens a few related actions, in place of doing one. It is a Menu whose button is the Fab:
   the button gets aria-haspopup and aria-expanded, the arrow keys move through the actions, and Escape, a pick or
   a press outside closes it and puts focus back on the button. The actions open toward the middle of the screen,
   above a Fab at the bottom (or a static one) and under one at the top, lined up with its outer edge. Its own
   component, so a plain Fab doesn't carry Menu. */
function FabMenuRender({ ref, ...props }: FabMenuProps & React.RefAttributes<HTMLButtonElement>) {
  const { actions, open, onOpenChange, ...fab } = props;
  const pos = oneOf(POSITIONS, fab.placement, 'bottom-end');
  const placement = (pos.startsWith('top') ? 'bottom' : 'top') + (pos.endsWith('start') ? '-start' : '-end') as 'top-end';
  return (
    <Menu trigger={<Fab {...fab} ref={ref} />} placement={placement} open={open} onOpenChange={onOpenChange && ((o) => onOpenChange(o))}
      aria-label={fab.label} className="dk-fab-menu">
      {actions.map((a, i) => <MenuItem key={i} icon={a.icon} disabled={a.disabled} destructive={a.destructive} onSelect={a.onSelect}>{a.label}</MenuItem>)}
    </Menu>
  );
}

/** A floating action button that opens a few related actions, each with its words shown.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const FabMenu = /* @__PURE__ */ named('FabMenu', FabMenuRender);
