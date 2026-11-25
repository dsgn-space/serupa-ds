'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { characterKey, current, none, on, parse, setSingleKeys, singleKeysOn, useShortcut, watch } from '../../internal/shortcuts';
import type { OpenChangeDetails } from '../../internal/openChange';
import { Dialog, type DialogProps } from '../Dialog/Dialog';
import { Kbd } from '../Kbd/Kbd';
import { Switch } from '../Switch/Switch';
import { DescriptionItem, DescriptionList } from '../DescriptionList/DescriptionList';
import { en as words } from './labels';

/** One shortcut in the help dialog. */
export interface Shortcut {
  /** The keys, pressed together, as Kbd takes them: ['mod', 'K'], ['?']. */
  keys: string[];
  /** What it does, in a few words ("Search", "New message"). */
  description: string;
  /** The heading it's listed under. Default: "General". */
  group?: string | undefined;
}

export { useShortcut };
export type { ShortcutOptions } from '../../internal/shortcuts';

export interface KeyboardShortcutsProps extends Omit<DialogProps, 'title' | 'description' | 'footer' | 'alert' | 'children' | 'size' | 'fullScreen' | 'initialFocus' | 'finalFocus' | 'closeButton' | 'closeOnBackdrop' | 'closeLabel' | 'unsaved'> {
  /** The dialog's title. Default: "Keyboard shortcuts" (labels.keyboardShortcuts). */
  title?: React.ReactNode | undefined;
  /** Shortcuts to list that aren't set up with useShortcut, such as the browser's or another library's. */
  shortcuts?: Shortcut[] | undefined;
  /** The keys that open it (default ['?']); false for none, when you open it yourself. */
  helpKeys?: string[] | false | undefined;
}

function KeyboardShortcutsRender({ ref, ...props }: KeyboardShortcutsProps & React.RefAttributes<HTMLDialogElement>) {
  const sds = useSettings(words), labels = sds.labels;
  const rest = omit(props, { title: 1, shortcuts: 1, helpKeys: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1 } as const);
  const [own, setOwn] = React.useState(!!props.defaultOpen);
  const open = props.open != null ? props.open : own;
  const { onOpenChange } = props;
  const change = (next: boolean, details: OpenChangeDetails) => {
    setOwn(next);
    if (onOpenChange) onOpenChange(next, details);
  };
  const help = props.helpKeys === false ? null : props.helpKeys && props.helpKeys.length ? props.helpKeys : ['?'];
  useShortcut(help || [], () => change(true, { reason: 'trigger' }), { description: labels.showShortcuts, enabled: !!help && !open });
  const live = React.useSyncExternalStore(watch, current, none);
  const singleKeys = React.useSyncExternalStore(watch, singleKeysOn, on);
  // The switch shows while a one-key shortcut is set up or listed: "?" itself, by default.
  const single1 = (keys: string[]) => { const c = parse(keys); return !!c && characterKey(c); };
  const hasSingle = (!!help && single1(help)) || live.some(characterKey) || (props.shortcuts || []).some((x) => single1(x.keys));
  // By group, in the order each first appears; the same keys and words listed once.
  const groups = new Map<string, Shortcut[]>();
  const seen = new Set<string>();
  for (const s of [...(props.shortcuts || []), ...live.filter((x) => x.description), ...(help && open ? [{ keys: help, description: labels.showShortcuts }] : [])]) {
    const name = s.group || labels.generalShortcuts, key = JSON.stringify([name, s.keys, s.description]);
    if (seen.has(key)) continue;
    seen.add(key);
    groups.set(name, (groups.get(name) || []).concat({ keys: s.keys, description: s.description || '' }));
  }
  return (
    <Dialog {...rest} ref={ref} className={cn('srp-keyboard-shortcuts', props.className)}
      title={props.title != null ? props.title : labels.keyboardShortcuts} open={open} onOpenChange={change}
      footer={hasSingle ? <Switch className="srp-keyboard-shortcuts__single" checked={singleKeys} onCheckedChange={setSingleKeys}
        description={labels.singleKeyHint}>{labels.singleKeyShortcuts}</Switch> : undefined}>
      {[...groups].map(([name, items]) => (
        <section key={name} className="srp-keyboard-shortcuts__group">
          {groups.size > 1 ? <h3 className="srp-keyboard-shortcuts__heading">{name}</h3> : null}
          <DescriptionList layout="split" className="srp-keyboard-shortcuts__list">
            {items.map((s, i) => (
              <DescriptionItem key={i} className="srp-keyboard-shortcuts__row" term={s.description}><Kbd keys={s.keys} /></DescriptionItem>
            ))}
          </DescriptionList>
        </section>
      ))}
    </Dialog>
  );
}

/* KeyboardShortcuts: the help dialog that lists the page's keyboard shortcuts, opened with "?" (helpKeys). It lists
   every useShortcut with a description, plus shortcuts, by group (in the order they first appear), each with its keys
   in Kbd. Put one in the app's layout. Open it yourself too (open and onOpenChange), from a help menu, so people who
   don't know "?" find it. Other props go to the Dialog. */
/** The help dialog listing the page's keyboard shortcuts in Kbd, opened with "?"; set them up with useShortcut. */
export const KeyboardShortcuts = /* @__PURE__ */ named('KeyboardShortcuts', KeyboardShortcutsRender);
