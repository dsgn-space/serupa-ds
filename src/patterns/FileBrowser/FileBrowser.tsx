'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { IconButton } from '../../components/IconButton/IconButton';
import { Dialog } from '../../components/Dialog/Dialog';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Alert } from '../../components/Alert/Alert';
import { Menu, MenuItem } from '../../components/Menu/Menu';
import { Toaster, toast } from '../../components/Toast/Toast';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { RelativeTime } from '../../components/RelativeTime/RelativeTime';
import { List, ListItem, ListSelectAll, ListLoadingItems } from '../../components/List/List';
import { TableActionBar } from '../../components/Table/Table';
import { formatFileSize } from '../../internal/formatFileSize';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* File browser: one folder's files as a list people pick from, to move or delete several at once, with rename, move
   and delete on each row too. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 4.1.2: the files are a List with selectionMode="multiple": a grid with one Tab stop, each row named by its
     file and said as selected or not, with a checkbox for the pointer. Select all sits above it.
   - 2.1.1: Space picks the focused row, Shift with the arrows picks a run, Ctrl or Cmd+A picks every file; each row's
     More menu is reached with Right.
   - 4.1.3: the bar above the list says how many are picked ("3 selected") as the count changes, since it appears away
     from the row that was pressed.
   - 2.4.6: each More button is named with its file ("More for Logo.svg"), so a list of them isn't "More, More, More".
   - 3.3.4: a delete happens at once, with Undo in a toast, for one file or many; it's final only when the toast
     goes, so nothing asks "Are you sure?" first.
   - 2.4.3: after a delete or a move, focus goes to the list (or to the page's h1 when the folder is now empty), never
     to the top of the page. After a rename it goes back to the file's More button.
   - 3.3.1, 3.3.3: an empty or taken name is said next to the field, which keeps focus; a move with no folder chosen
     says so; a move or rename that fails says so in its dialog, which stays open with what was chosen.
   - 4.1.3, 3.3.1: while the files load, the list is busy with placeholder rows, named once; a failed load says so,
     with Try again; an empty folder says so, with the way to add the first file.
   Storing the changes is the app's job: onDelete, onMove and onRename get them, and onUpload gets Upload files. */

export type FileKind = 'folder' | 'image' | 'pdf' | 'doc' | 'sheet' | 'other';
export interface BrowserFile {
  id: string;
  /** With its extension: "Logo.svg". */
  name: string;
  /** Picks the row's icon. Default: 'other'. */
  kind?: FileKind | undefined;
  /** Its size in bytes. Leave it out for a folder. */
  bytes?: number | undefined;
  /** When it last changed: a Date, a time in ms, or an ISO string. */
  modified: Date | number | string;
  /** Where the file opens. With it, the row's name is a link. */
  href?: string | undefined;
}
export interface BrowserFolder {
  id: string;
  name: string;
}

export interface FileBrowserProps {
  /** The folder's name: the page's h1. Default: "Brand assets". */
  folder?: string | undefined;
  /** The folders above this one, from the top, each with an href. Default: Files. */
  path?: { label: string; href: string }[] | undefined;
  /** The folder's files. Default: six demo files. */
  files?: readonly BrowserFile[] | undefined;
  /** The folders files can move to. Default: three demo folders. */
  folders?: readonly BrowserFolder[] | undefined;
  /** The files picked at first, by id. Default: none. */
  defaultSelected?: string[] | undefined;
  /** Files were deleted and their Undo has passed. */
  onDelete?: ((ids: string[]) => void) | undefined;
  /** Move was pressed with a folder chosen. Return its promise: a rejection keeps the dialog open and says so. */
  onMove?: ((ids: string[], folderId: string) => unknown) | undefined;
  /** A new name was saved. Return its promise: a rejection keeps the dialog open and says so. */
  onRename?: ((id: string, name: string) => unknown) | undefined;
  /** Upload files was pressed. */
  onUpload?: (() => void) | undefined;
  /** The files are on their way: placeholder rows, named once ("Loading files"). Default: false. */
  loading?: boolean | undefined;
  /** The files failed to load: a message with Try again, which calls onRetry, in their place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the files again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const now = Date.now();
const DAY = 86400_000;
const demoFiles: BrowserFile[] = [
  { id: 'f1', name: 'Logos', kind: 'folder', modified: now - 2 * DAY },
  { id: 'f2', name: 'Brand guidelines.pdf', kind: 'pdf', bytes: 4_820_000, modified: now - 3 * 3600_000 },
  { id: 'f3', name: 'Logo.svg', kind: 'image', bytes: 18_400, modified: now - 6 * DAY },
  { id: 'f4', name: 'Launch photo.jpg', kind: 'image', bytes: 3_400_000, modified: now - 9 * DAY },
  { id: 'f5', name: 'Press release.docx', kind: 'doc', bytes: 24_000, modified: now - 20 * DAY },
  { id: 'f6', name: 'Budget 2026.xlsx', kind: 'sheet', bytes: 88_000, modified: now - 41 * DAY },
];
const demoFolders: BrowserFolder[] = [{ id: 'd1', name: 'Archive' }, { id: 'd2', name: 'Marketing' }, { id: 'd3', name: 'Shared with clients' }];
const ICON: Record<FileKind, string> = { folder: 'folder', image: 'image', pdf: 'picture_as_pdf', doc: 'description', sheet: 'table_chart', other: 'draft' };

/** "1 file" or "3 files": English's rule, since the words are English; an app translating them uses its own. */
export const countFiles = (n: number, locale = 'en-US'): string => (n === 1 ? '1 file' : `${formatNumber(n, locale)} files`);

/** What's wrong with a new name, or null: empty, or one another file here already has (whatever its case). */
export function nameProblem(name: string, id: string, files: readonly BrowserFile[]): string | null {
  const kept = name.trim();
  if (!kept) return 'Enter a name.';
  if (files.some((f) => f.id !== id && f.name.toLowerCase() === kept.toLowerCase())) return `“${kept}” is already in this folder. Choose another name.`;
  return null;
}

/** The file browser: a skip link, a header, then main with the folder's h1, the selection bar and the list. */
export function FileBrowser({ folder = 'Brand assets', path = [{ label: 'Files', href: '#files' }], files: all = demoFiles, folders = demoFolders,
  defaultSelected, onDelete, onMove, onRename, onUpload, loading = false, loadFailed = false, onRetry, online }: FileBrowserProps) {
  const locale = useLocale();
  // What's shown: the files, less those deleted or moved away, with any new names.
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set());
  const [names, setNames] = React.useState<Readonly<Record<string, string>>>({});
  const files = all.filter((f) => !hidden.has(f.id)).map((f) => (names[f.id] ? { ...f, name: names[f.id]! } : f));
  const [picked, setPicked] = React.useState<string[]>(defaultSelected ?? []);
  const chosen = picked.filter((id) => files.some((f) => f.id === id));

  const title = React.useRef<HTMLHeadingElement>(null);
  const later = (f: () => void) => requestAnimationFrame(f);
  // The list is one Tab stop: its focusable row. With no rows left, the h1.
  const toList = (left: number) => later(() => {
    const row = left ? document.querySelector<HTMLElement>('#file-list [tabindex="0"]') : null;
    (row ?? title.current)?.focus();
  });
  const hide = (ids: string[]) => setHidden((h) => { const n = new Set(h); for (const id of ids) n.add(id); return n; });
  const show = (ids: string[]) => setHidden((h) => { const n = new Set(h); for (const id of ids) n.delete(id); return n; });
  const said = (ids: string[]) => (ids.length === 1 ? `“${files.find((f) => f.id === ids[0])?.name ?? ''}”` : countFiles(ids.length, locale));

  // Deleting: at once, with Undo. It's final when the toast goes.
  const remove = (ids: string[]) => {
    if (!ids.length) return;
    const what = said(ids);
    hide(ids);
    setPicked((p) => p.filter((id) => !ids.includes(id)));
    toList(files.length - ids.length);
    toast.undo({
      title: `Deleted ${what}`,
      commit: () => onDelete?.(ids),
      onUndo: () => { show(ids); toList(1); },
    });
  };

  // Moving: a dialog with the folders, one to choose.
  const [moving, setMoving] = React.useState<string[] | null>(null);
  const [target, setTarget] = React.useState('');
  const [moveError, setMoveError] = React.useState<string | null>(null);
  const [moveFailed, setMoveFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const askMove = (ids: string[]) => { setTarget(''); setMoveError(null); setMoveFailed(false); setMoving(ids); };
  const move = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = moving ?? [];
    if (!target) { setMoveError('Choose a folder.'); return; }
    const to = folders.find((d) => d.id === target)?.name ?? '';
    const what = said(ids);
    setMoveFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onMove?.(ids, target)).then(() => {
      setMoving(null);
      hide(ids);
      setPicked((p) => p.filter((id) => !ids.includes(id)));
      toast({ title: `Moved ${what} to ${to}`, tone: 'success' });
      toList(files.length - ids.length);
    }, () => setMoveFailed(true)).finally(() => setBusy(false));
  };

  // Renaming: a dialog with the name, checked before it's sent.
  const [renaming, setRenaming] = React.useState<BrowserFile | null>(null);
  const [name, setName] = React.useState('');
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [renameFailed, setRenameFailed] = React.useState(false);
  const moreButton = React.useRef<HTMLElement | null>(null);
  const askRename = (f: BrowserFile) => {
    moreButton.current = document.getElementById(`more-${f.id}`);
    setName(f.name); setNameError(null); setRenameFailed(false); setRenaming(f);
  };
  const rename = (e: React.FormEvent) => {
    e.preventDefault();
    const f = renaming;
    if (!f) return;
    const problem = nameProblem(name, f.id, files);
    if (problem) { setNameError(problem); document.getElementById('file-name')?.focus(); return; }
    const kept = name.trim();
    if (kept === f.name) { setRenaming(null); return; }
    setRenameFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onRename?.(f.id, kept)).then(() => {
      setNames((n) => ({ ...n, [f.id]: kept }));
      setRenaming(null);
      toast({ title: `Renamed to “${kept}”`, tone: 'success' });
    }, () => setRenameFailed(true)).finally(() => setBusy(false));
  };

  const upload = { label: 'Upload files', icon: 'upload', onSelect: () => onUpload?.() };
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">These are the files loaded before you went offline. Opening, moving or uploading needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[...path, { label: folder }]} title={folder} headingRef={title} primary={upload}
          description={loading || loadFailed ? undefined : countFiles(files.length, locale)} />

        <div className="flex flex-col gap-3 pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load the files" onRetry={() => onRetry?.()} headingLevel={2} />
            : !loading && !files.length ? (
              <EmptyState icon="folder_open" title="This folder is empty" headingLevel={2} description="Upload files to keep them here, or move some in from another folder."
                actions={<Button startIcon="upload" onClick={() => onUpload?.()}>Upload files</Button>} />
            ) : <>
              {loading ? null : (
                <div className="flex min-h-10 flex-wrap items-center gap-3">
                  <ListSelectAll values={files.map((f) => f.id)} selected={chosen} onSelectedChange={setPicked} />
                  <TableActionBar count={chosen.length} onClear={() => setPicked([])} className="flex-1">
                    <Button size="sm" variant="outline" startIcon="drive_file_move" onClick={() => askMove(chosen)}>Move</Button>
                    <Button size="sm" variant="outline" destructive startIcon="delete" onClick={() => remove(chosen)}>Delete</Button>
                  </TableActionBar>
                </div>
              )}
              <List id="file-list" aria-label={`Files in ${folder}`} variant="card" loading={loading} selectionMode={loading ? 'none' : 'multiple'}
                selected={chosen} onSelectedChange={setPicked}>
                {loading ? <ListLoadingItems rows={5} showDescription leading="icon" label="Loading files" /> : files.map((f) => (
                  <ListItem key={f.id} value={f.id} href={f.href} leading={ICON[f.kind ?? 'other']} title={f.name}
                    description={<>{f.kind === 'folder' ? 'Folder' : f.bytes != null ? formatFileSize(f.bytes, locale) : null}{f.kind === 'folder' || f.bytes != null ? ', ' : null}<span className="whitespace-nowrap">changed <RelativeTime date={f.modified} /></span></>}
                    trailing={(
                      <Menu placement="bottom-end" trigger={<IconButton id={`more-${f.id}`} icon="more_vert" label={`More for ${f.name}`} size="sm" variant="ghost" hideTitle />}>
                        <MenuItem icon="edit" onSelect={() => askRename(f)}>Rename</MenuItem>
                        <MenuItem icon="drive_file_move" onSelect={() => askMove([f.id])}>Move</MenuItem>
                        <MenuItem icon="delete" destructive onSelect={() => remove([f.id])}>Delete</MenuItem>
                      </Menu>
                    )} />
                ))}
              </List>
            </>}
        </div>

        <Dialog open={moving != null} onOpenChange={(o) => { if (!o) setMoving(null); }} title={`Move ${moving ? said(moving) : ''}`}
          description="Choose the folder to move to.">
          <form onSubmit={move} noValidate className="flex flex-col gap-4">
            {moveFailed ? <Alert tone="danger">Couldn’t move {moving ? said(moving) : ''}. Try again.</Alert> : null}
            <Field group label="Folder" error={moveError ?? undefined} required>
              <RadioGroup name="folder" value={target} onValueChange={(v: string) => { setTarget(v); setMoveError(null); }}>
                {folders.map((d) => <Radio key={d.id} value={d.id}>{d.name}</Radio>)}
              </RadioGroup>
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={busy}>Move</Button>
              <Button variant="outline" onClick={() => setMoving(null)}>Cancel</Button>
            </div>
          </form>
        </Dialog>

        <Dialog open={renaming != null} onOpenChange={(o) => { if (!o) setRenaming(null); }} title="Rename" finalFocus={moreButton}>
          <form onSubmit={rename} noValidate className="flex flex-col gap-4">
            {renameFailed ? <Alert tone="danger">Couldn’t rename “{renaming?.name}”. Try again.</Alert> : null}
            <Field label="Name" id="file-name" error={nameError ?? undefined} required>
              <Input name="name" value={name} autoComplete="off" onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null); }} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={busy}>Rename</Button>
              <Button variant="outline" onClick={() => setRenaming(null)}>Cancel</Button>
            </div>
          </form>
        </Dialog>
      </main>
      <Toaster />
    </div>
  );
}
