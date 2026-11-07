'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Dialog } from '../../components/Dialog/Dialog';
import { InlineEdit } from '../../components/InlineEdit/InlineEdit';
import { Tabs, TabList, Tab, TabPanel } from '../../components/Tabs/Tabs';
import { TypeToConfirm } from '../../components/TypeToConfirm/TypeToConfirm';
import { Toaster, toast } from '../../components/Toast/Toast';
import { Alert } from '../../components/Alert/Alert';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Detail page: one thing (a project) with where it sits, its name and details editable in place, its parts in tabs,
   small removals that can be undone, and a delete that can't, behind typing its name. For an app to copy. What it
   carries (WCAG 2.2):
   - 2.4.8, 1.3.1: a breadcrumb says where the page sits, the h1 is the project's name, and each tab's panel is
     named by its tab.
   - 3.3.4: removing a task happens at once with Undo in a toast, and is done for good only when the toast goes;
     deleting the project, which can't be undone, asks for its name first, in a dialog that says what will be lost.
   - 2.4.3: after a removal, focus goes to the next task (or the list's heading), never to the top of the page; after
     the delete, to the h1 of the page that says it's gone.
   - 4.1.3: the toast says what was removed; a saved name is shown in the h1 at once.
   - 3.3.1: a name left empty says so, and the old name stays; a delete that fails says so in the dialog, which stays
     open with focus on its button, so it can be tried again.
   Storing the changes is the app's job: onRename, onRemoveTask and onDelete get them. */

export interface ProjectTask { id: string; title: string }
export interface Project { name: string; description: string; owner: string; created: string; tasks: readonly ProjectTask[] }

export interface DetailPageProps {
  /** The project shown. Default: a demo project. */
  project?: Project | undefined;
  /** A new name or description was saved. */
  onRename?: ((field: 'name' | 'description', value: string) => void) | undefined;
  /** A removed task's toast closed without Undo: remove it for good. */
  onRemoveTask?: ((id: string) => void) | undefined;
  /** The project's name was typed and Delete pressed. Return its promise, so the button shows it's busy. */
  onDelete?: (() => unknown) | undefined;
}

const demo: Project = {
  name: 'Website redesign', description: 'New pages for the marketing site, with the updated brand.', owner: 'Ana Lima', created: '2026-09-14',
  tasks: [
    { id: 't1', title: 'Draft the home page copy' }, { id: 't2', title: 'Pick the photos' },
    { id: 't3', title: 'Review the pricing page' }, { id: 't4', title: 'Check the forms with a screen reader' },
  ],
};

// "14 September 2026" in the reader's locale for "2026-09-14", read as that calendar day wherever the reader is;
// anything else as it came.
function day(iso: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  try { return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))); } catch { return iso; }
}

const english = /* @__PURE__ */ new Intl.PluralRules('en');

/** The detail page: a skip link, a header, then main with the breadcrumb, the h1, the tabs and the danger zone. */
export function DetailPage({ project = demo, onRename, onRemoveTask, onDelete }: DetailPageProps) {
  const [name, setName] = React.useState(project.name);
  const [description, setDescription] = React.useState(project.description);
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set());
  const [asking, setAsking] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const locale = useLocale();
  // The Undo toasts still open, and whether the project is gone: once it is, they close without removing anything,
  // since the delete took their tasks with it.
  const pending = React.useRef(new Set<string>());
  const gone = React.useRef(false);
  const tasksHeading = React.useRef<HTMLHeadingElement>(null);
  const goneHeading = React.useRef<HTMLHeadingElement>(null);
  const tasks = project.tasks.filter((t) => !hidden.has(t.id));
  const later = (f: () => void) => requestAnimationFrame(f);
  const removeButton = (id: string) => () => document.getElementById(`task-${id}`)?.focus();

  React.useEffect(() => { if (deleted) goneHeading.current?.focus(); }, [deleted]);

  const remove = (t: ProjectTask) => {
    const at = tasks.indexOf(t), next = tasks[at + 1] || tasks[at - 1];
    setHidden((h) => new Set(h).add(t.id));
    later(next ? removeButton(next.id) : () => tasksHeading.current?.focus());
    const id: string = toast.undo({
      title: `Removed “${t.title}”`,
      commit: () => { pending.current.delete(id); if (!gone.current) onRemoveTask?.(t.id); },
      onUndo: () => { pending.current.delete(id); setHidden((h) => { const n = new Set(h); n.delete(t.id); return n; }); later(removeButton(t.id)); },
    });
    pending.current.add(id);
  };
  // Saved without the spaces around it, as the check reads it.
  const save = (field: 'name' | 'description', set: (v: string) => void) => (v: string) => { const kept = v.trim(); set(kept); onRename?.(field, kept); };
  // A delete that fails, by rejecting or by throwing, keeps the dialog open and says so, instead of leaving the error
  // unhandled. The promise goes back to the button, which shows it's busy while a slow delete runs.
  const confirm = () => {
    setFailed(false);
    return Promise.resolve().then(() => onDelete?.()).then(() => {
      gone.current = true;
      for (const id of [...pending.current]) toast.dismiss(id);
      setAsking(false);
      setDeleted(true);
    }, () => setFailed(true));
  };
  const ask = (open: boolean) => { setAsking(open); if (!open) setFailed(false); };
  // What the dialog says will be lost: the tasks still there, with the word that fits the number: the words are
  // English, so the rule is too; an app translating them passes its own locale.
  const lost = tasks.length
    ? `its ${tasks.length} ${english.select(tasks.length) === 'one' ? 'task' : 'tasks'} and files`
    : 'its files';

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 outline-none">
        {deleted ? (
          <div className="flex flex-col gap-3">
            <Heading level={1} ref={goneHeading} tabIndex={-1} className="outline-none">{name} was deleted</Heading>
            <p className="m-0 text-text-muted">Its tasks and files are gone too.</p>
            <Link href="#projects">Back to projects</Link>
          </div>
        ) : (
          <>
            <PageHeader breadcrumb={[{ label: 'Projects', href: '#projects' }, { label: name }]} title={name} description={description}
              primary={{ label: 'Share', href: '#share' }} />

            <Tabs defaultValue="overview">
              <TabList aria-label="Project">
                <Tab value="overview">Overview</Tab>
                <Tab value="tasks">Tasks</Tab>
                <Tab value="settings">Settings</Tab>
              </TabList>

              <TabPanel value="overview" className="pt-4">
                <Card>
                  <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
                    <dt className="font-medium">Name</dt>
                    <dd className="m-0 min-w-0 sm:col-span-2">
                      <InlineEdit label="Project name" value={name} onValueChange={save('name', setName)}
                        validate={(v) => (v.trim() ? null : 'Enter a name for the project.')} />
                    </dd>
                    <dt className="font-medium">Description</dt>
                    <dd className="m-0 min-w-0 sm:col-span-2"><InlineEdit label="Description" value={description} onValueChange={save('description', setDescription)} /></dd>
                    <dt className="font-medium">Owner</dt><dd className="m-0 sm:col-span-2">{project.owner}</dd>
                    <dt className="font-medium">Created</dt><dd className="m-0 sm:col-span-2"><time dateTime={project.created}>{day(project.created, locale)}</time></dd>
                  </dl>
                </Card>
              </TabPanel>

              <TabPanel value="tasks" className="pt-4">
                <Card className="flex flex-col gap-3">
                  <Heading level={2} size="lg" ref={tasksHeading} tabIndex={-1} className="outline-none">Tasks ({tasks.length})</Heading>
                  {tasks.length ? (
                    <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
                      {tasks.map((t) => (
                        <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                          <span className="min-w-0">{t.title}</span>
                          <Button id={`task-${t.id}`} size="sm" variant="ghost" aria-label={`Remove ${t.title}`} onClick={() => remove(t)}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="m-0 text-text-muted">No tasks left.</p>}
                </Card>
              </TabPanel>

              <TabPanel value="settings" className="pt-4">
                <section aria-labelledby="danger" className="flex flex-col gap-3 rounded-lg border border-danger bg-surface p-4">
                  <Heading level={2} size="lg" id="danger">Delete this project</Heading>
                  <p className="m-0 max-w-prose">Deleting removes the project with its tasks and files for everyone. It can't be undone.</p>
                  <div><Button destructive variant="outline" onClick={() => ask(true)}>Delete project</Button></div>
                </section>
              </TabPanel>
            </Tabs>

            <Dialog alert open={asking} onOpenChange={ask} title={`Delete ${name}?`}
              description={`This deletes the project and ${lost} for everyone. It can't be undone.`}>
              <div className="flex flex-col gap-4">
                {failed ? <Alert tone="danger">Couldn't delete {name}. Try again.</Alert> : null}
                <TypeToConfirm phrase={name} confirmLabel="Delete this project" onConfirm={confirm} />
              </div>
            </Dialog>
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}
