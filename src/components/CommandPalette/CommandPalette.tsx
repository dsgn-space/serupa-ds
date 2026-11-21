'use client';
import { numberFormat } from '../../internal/intl';
import * as React from 'react';
import { useControllable } from '../../internal/controllable';
import { cn, domId, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { isComposing } from '../../internal/ime';
import { fold } from '../../internal/fold';
import { announcePause } from '../../internal/timing';
import type { OpenChangeDetails } from '../../internal/openChange';
import type { IconData } from '../../material/types';
import { LoaderRing } from '../../internal/loaderRing';
import { asIcon } from '../Icon/asIcon';
import { Dialog, type DialogProps } from '../Dialog/Dialog';
import { Highlight } from '../Highlight/Highlight';
import { Kbd } from '../Kbd/Kbd';
import { useShortcut } from '../KeyboardShortcuts/KeyboardShortcuts';
import { en as words } from './labels';
import { warnOnce } from '../../internal/warn';
import { leave } from '../../internal/leave';

/* A command's href leaves by location.assign, which React's block on javascript: URLs doesn't cover: only a web
   page (http, https, or a path on this site), mailto: or tel: goes (internal/leave.ts). Anything else (javascript:,
   data:, vbscript:) does nothing, and warns in development. */
function go(href: string) {
  if (!leave(href) && process.env.NODE_ENV !== 'production') warnOnce('command-palette-href', 'CommandPalette: a command\'s href ' + JSON.stringify(href) + " isn't a web page, mailto: or tel: link, so choosing it does nothing. Use onSelect to run code.");
}

/** One command or page in the palette. */
export interface Command {
  /** Unique among the commands. */
  id: string;
  /** What it does or where it goes, in a few words ("New project", "Settings"). What's typed is matched against it. */
  label: string;
  /** The heading it's listed under ("Pages", "Actions"), in the order groups first appear. Default: "Commands". */
  group?: string | undefined;
  /** A line under the label saying more ("Color scheme, density and language"). Shown muted, read after the label and matched like keywords. */
  description?: string | undefined;
  /** More words that find it, not shown ("preferences" for Settings). */
  keywords?: string[] | undefined;
  /** An icon before the label: a name or an icon from serupa-ds/icons. */
  icon?: React.ReactNode | IconData | undefined;
  /** Keys shown after the label in Kbd (["mod", "N"]). Shown only: set the shortcut itself up with useShortcut. */
  shortcut?: string[] | undefined;
  /** A page to go to when it's chosen, with no onSelect. */
  href?: string | undefined;
  /** Shown but can't be chosen. */
  disabled?: boolean | undefined;
  /** Runs when it's chosen, after the palette has closed. */
  onSelect?: (() => void) | undefined;
}

export interface CommandPaletteProps extends Omit<DialogProps, 'title' | 'description' | 'footer' | 'alert' | 'children' | 'size' | 'fullScreen' | 'initialFocus' | 'closeButton' | 'closeLabel' | 'onSelect' | 'unsaved'> {
  /** The commands and pages it searches, in the order they're listed before anything is typed. */
  commands: Command[];
  /** Runs for any command chosen, after the palette has closed and after the command's own onSelect. */
  onSelect?: ((command: Command) => void) | undefined;
  /** The keys that open it anywhere on the page (default ["mod", "K"]: ⌘K on Apple devices, Ctrl+K elsewhere); false for none. */
  hotkey?: string[] | false | undefined;
  /** The search field's placeholder and name. Default: "Search commands and pages" (labels.searchCommands). */
  placeholder?: string | undefined;
  /** Shown when nothing matches. Default: "No matching commands" (labels.noCommands). */
  emptyText?: React.ReactNode | undefined;
  /** How many it lists at most while searching, the best matches first. Default: 50. */
  limit?: number | undefined;
  /** What's in the search field (controlled): an opening then keeps it, so you can open the palette on a search. Use with onQueryChange. */
  query?: string | undefined;
  /** Called with what's typed, as it changes (and with "" when an opening clears it): to fetch the commands that match
   *  from a server, with filter={false} and loading. */
  onQueryChange?: ((query: string) => void) | undefined;
  /** false: lists the commands as given, in their order, as the ones your search found (what was typed is still marked
   *  in them). Default: true, it filters and sorts them itself. */
  filter?: boolean | undefined;
  /** Shows a loading row under what's listed and marks the list busy; "nothing matches" waits until it ends. Default: false. */
  loading?: boolean | undefined;
  /** Shown while loading. Default: "Loading…" (labels.loading). */
  loadingText?: string | undefined;
}

interface Row { c: Command; i: number; s: number }

// How well a command matches the folded query: 0 for no match; the label itself beats a label that starts with it,
// which beats one with a word that does, which beats one that has it inside, which beats a keyword.
function score(c: Command, q: string): number {
  if (!q) return 1;
  const label = fold(c.label);
  if (label === q) return 5;
  if (label.startsWith(q)) return 4;
  const at = label.indexOf(q);
  if (at > 0 && /[\s\-_/.:]/.test(label.charAt(at - 1))) return 3;
  if (at > 0) return 2;
  return (c.keywords || []).concat(c.description || []).some((k) => fold(k).includes(q)) ? 1 : 0;
}

function CommandPaletteRender({ ref, ...props }: CommandPaletteProps & React.RefAttributes<HTMLDialogElement>) {
  const sds = useSettings(words), labels = sds.labels, locale = useLocale();
  const rest = omit(props, { commands: 1, onSelect: 1, hotkey: 1, placeholder: 1, emptyText: 1, limit: 1, query: 1, onQueryChange: 1, filter: 1, loading: 1, loadingText: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1, closeOnBackdrop: 1, finalFocus: 1 } as const);
  // null counts as not passed, as it always has here.
  const [openIn, setOwn, controlled] = useControllable(props.open == null ? undefined : props.open, !!props.defaultOpen, 'CommandPalette', 'open');
  const open = !!openIn;
  const { onOpenChange } = props;
  const change = React.useCallback((next: boolean, details: OpenChangeDetails) => {
    if (!controlled) setOwn(next);
    if (onOpenChange) onOpenChange(next, details);
  }, [onOpenChange, controlled, setOwn]);
  const keys = props.hotkey === false ? null : props.hotkey && props.hotkey.length ? props.hotkey : ['mod', 'K'];
  useShortcut(keys || [], () => change(true, { reason: 'trigger' }), { description: labels.commandPalette, enabled: !!keys && !open });

  const [query, setOwnQuery, queryControlled] = useControllable(props.query ?? undefined, '', 'CommandPalette', 'query');
  const [active, setActive] = React.useState(0);
  // Each opening starts at the top of the list, from an empty field unless the app holds what's in it (query).
  const [was, setWas] = React.useState(open);
  if (was !== open) { setWas(open); if (open) { if (!queryControlled) setOwnQuery(''); setActive(0); } }

  // What's typed goes to onQueryChange: at once when the app holds the query, else once it has changed here (the
  // clearing of a new opening included).
  const told = React.useRef(query);
  const onQuery = React.useRef(props.onQueryChange); onQuery.current = props.onQueryChange;
  React.useEffect(() => {
    if (told.current === query) return;
    told.current = query;
    if (!queryControlled && onQuery.current) onQuery.current(query);
  }, [query, queryControlled]);
  const setQuery = (v: string) => {
    if (!queryControlled) { setOwnQuery(v); return; }
    told.current = v;
    if (onQuery.current) onQuery.current(v);
  };

  const q = fold(query.trim());
  const { commands, limit } = props;
  const own = props.filter !== false, loading = !!props.loading;
  const rows: Row[] = React.useMemo(() => {
    if (!own) return commands.map((c, i) => ({ c, i, s: 1 }));
    const all = commands.map((c, i) => ({ c, i, s: score(c, q) })).filter((r) => r.s > 0);
    if (!q) return all;
    // Among labels that match alike, the shorter is the closer match: "tab" lists Tabs before Table and TableOfContents.
    const near = (r: Row) => (r.s > 1 ? r.c.label.length : 0);
    return all.sort((a, b) => b.s - a.s || near(a) - near(b) || a.i - b.i).slice(0, limit && limit > 0 ? limit : 50);
  }, [commands, q, limit, own]);
  // By group, in the order each first appears among the rows; the rows keep their order inside a group.
  const groups = React.useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of rows) { const g = r.c.group || labels.otherCommands; m.set(g, (m.get(g) || []).concat(r)); }
    return [...m];
  }, [rows, labels.otherCommands]);
  const usable = groups.flatMap(([, rs]) => rs).filter((r) => !r.c.disabled);   // in the order listed, which is the arrows' order
  const current = usable[Math.min(active, usable.length - 1)] ?? null;

  const base = domId('dk-cmdk', React.useId());
  const optId = (r: Row) => base + '-opt-' + r.i;
  const list = React.useRef<HTMLDivElement | null>(null);
  const field = React.useRef<HTMLInputElement | null>(null);
  const currentId = current ? optId(current) : null;
  React.useEffect(() => {
    if (!open || !currentId || !list.current) return;
    const el = list.current.querySelector<HTMLElement>('#' + currentId);
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  }, [open, currentId]);

  // How many match, said once typing stops (the rows change in silence otherwise).
  const empty = typeof props.emptyText === 'string' ? props.emptyText : labels.noCommands;
  const said = !query.trim() || loading ? '' : usable.length ? labels.commandsCount(usable.length, numberFormat(locale).format(usable.length)) : empty;
  React.useEffect(() => {
    if (!open || !said) return;
    const t = setTimeout(() => announce(said), announcePause);
    return () => clearTimeout(t);
  }, [open, said, query]);

  // The chosen command runs once the palette has closed and given focus back, so its onSelect can move focus on the
  // page (behind the open modal the page is inert) and its href leaves from the page as it was (GR97). An app that
  // keeps a controlled palette open gets it run at once.
  const [chosen, setChosen] = React.useState<{ c: Command } | null>(null);
  const done = React.useRef(props.onSelect); done.current = props.onSelect;
  React.useEffect(() => {
    if (!chosen) return;
    setChosen(null);
    const c = chosen.c;
    if (c.onSelect) c.onSelect();
    else if (c.href && typeof window !== 'undefined') go(c.href);
    if (done.current) done.current(c);
  }, [chosen]);
  const choose = (r: Row | null) => {
    if (!r || r.c.disabled) return;
    change(false, { reason: 'select' });
    setChosen({ c: r.c });
  };
  const move = (to: number) => { if (usable.length) setActive((to + usable.length) % usable.length); };
  // Stable handlers for the memoised rows, reading the latest state through a ref: moving the highlight then redraws
  // the two rows it moves between, not every command.
  const handlers = { choose, hover: (r: Row) => { if (!r.c.disabled && current !== r) setActive(usable.indexOf(r)); } };
  const live = React.useRef(handlers);
  live.current = handlers;
  const act = React.useMemo<OptionActs>(() => ({ choose: (r) => live.current.choose(r), hover: (r) => live.current.hover(r) }), []);
  const at = current ? usable.indexOf(current) : 0;
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing(e)) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(at + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(at - 1); }
    else if (e.key === 'PageDown') { e.preventDefault(); move(usable.length - 1); }
    else if (e.key === 'PageUp') { e.preventDefault(); move(0); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(current); }
  };

  return (
    <Dialog {...rest} ref={ref} className={cn('dk-command-palette', props.className)} aria-label={rest['aria-label'] || labels.commandPalette}
      open={open} onOpenChange={change} closeButton={false} initialFocus={field} closeOnBackdrop={props.closeOnBackdrop} finalFocus={props.finalFocus}>
      <input ref={field} className="dk-command-palette__field" type="text" role="combobox" aria-expanded="true" aria-controls={base + '-list'}
        aria-autocomplete="list" aria-activedescendant={currentId || undefined} aria-label={props.placeholder || labels.searchCommands}
        placeholder={props.placeholder || labels.searchCommands} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        value={query} onChange={(e) => { setQuery(e.currentTarget.value); setActive(0); }} onKeyDown={onKeyDown} />
      <div ref={list} id={base + '-list'} role="listbox" aria-label={labels.commandPalette} aria-busy={loading || undefined} className="dk-command-palette__list">
        {groups.map(([name, rs], g) => (
          <div key={name} role="group" aria-labelledby={base + '-g' + g} className="dk-command-palette__group">
            <div id={base + '-g' + g} role="presentation" className="dk-command-palette__heading">{name}</div>
            {rs.map((r) => <Option key={r.c.id} r={r} id={optId(r)} on={current === r} query={query} act={act} />)}
          </div>
        ))}
      </div>
      {loading ? <p className="dk-command-palette__empty dk-command-palette__loading" role="status"><LoaderRing size="sm" />{props.loadingText || labels.loading}</p> : null}
      {!usable.length && query.trim() && !loading ? <p className="dk-command-palette__empty">{props.emptyText != null ? props.emptyText : labels.noCommands}</p> : null}
    </Dialog>
  );
}

/* CommandPalette: a Dialog with a search field over a list of commands and pages, opened with ⌘K or Ctrl+K (hotkey)
   from anywhere on the page. Typing filters the list (ignoring case and accents, best matches first) and marks what
   matched; ArrowUp and ArrowDown move through it while focus stays in the field (role="combobox" with
   aria-activedescendant over a role="listbox"), Enter or a click chooses. Choosing closes the palette, then runs the
   command's onSelect (or goes to its href) and onSelect. The number of matches is said once typing stops. Other props
   and ref go to the Dialog's <dialog>. */
/** A ⌘K search over commands and pages in a dialog: type to filter, arrows to move, Enter to run.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const CommandPalette = /* @__PURE__ */ named('CommandPalette', CommandPaletteRender);

interface OptionActs { choose: (r: Row) => void; hover: (r: Row) => void }

// One row. Memoised on what it shows (its command, whether it's highlighted, the query it marks), so an arrow key or
// the pointer moving the highlight redraws two rows, not the whole list.
const Option = /* @__PURE__ */ React.memo(function Option({ r, id, on, query, act }: { r: Row; id: string; on: boolean; query: string; act: OptionActs }) {
  return (
    // Focus stays in the field (a press doesn't take it); an option focused some other way, as a screen reader can, is
    // chosen with Enter or Space.
    <div id={id} role="option" tabIndex={-1} aria-selected={on} aria-disabled={r.c.disabled || undefined} aria-describedby={r.c.description ? `${id}-d` : undefined}
      className={cn('dk-command-palette__option', on && 'dk-command-palette__option--active', r.c.disabled && 'dk-command-palette__option--disabled')}
      onMouseDown={(e) => e.preventDefault()} onMouseMove={() => act.hover(r)} onClick={() => act.choose(r)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act.choose(r); } }}>
      {r.c.icon != null ? <span className="dk-command-palette__icon" aria-hidden>{asIcon(r.c.icon)}</span> : null}
      {r.c.description ? (
        <span className="dk-command-palette__text">
          <Highlight className="dk-command-palette__label" query={query}>{r.c.label}</Highlight>
          <span id={`${id}-d`} className="dk-command-palette__description">{r.c.description}</span>
        </span>
      ) : <Highlight className="dk-command-palette__label" query={query}>{r.c.label}</Highlight>}
      {r.c.shortcut && r.c.shortcut.length ? <Kbd className="dk-command-palette__keys" keys={r.c.shortcut} size="sm" /> : null}
    </div>
  );
});
