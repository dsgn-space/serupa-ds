import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Progress } from '../../components/Progress/Progress';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { announce } from '../../internal/announce';

/* Onboarding / first run (PT11): the first page a new account sees. A checklist of setup steps with how far along it
   is, an empty state that says what to do first, and progress that's kept between visits. For an app to copy.
   What it carries (WCAG 2.2):
   - 1.3.1: the steps are an ordered list, each a heading (h3 under the checklist's h2), so a screen reader can list
     and jump between them, and hears "1 of 4".
   - 1.4.1: a done step says "Done" in words beside its tick, not by color or a strike-through alone.
   - 4.1.3: ticking a step says the new count ("2 of 4 steps done") politely, without moving focus. The last tick says
     "You're all set" once, and the page shows what's next.
   - 2.4.3: hiding the checklist moves focus to "Show the checklist", which takes its place; showing it again moves
     focus to the checklist's heading, so focus never drops to the page's start.
   - Progress and the hidden choice are kept between visits (here in localStorage under
     `saveKey`; an app keeps them on its server with `onChange`), so nobody is asked to do a step twice.
   Doing each step (the pages its link opens) is the app's job; here the links go nowhere. */

export interface SetupStep {
  id: string;
  /** What to do, as a short command: "Invite your team". */
  title: string;
  /** Why, in a sentence. */
  description: string;
  /** Where the step is done. */
  action: { label: string; href: string };
}

export interface OnboardingState {
  /** The ids of the steps that are done. */
  done: string[];
  /** The checklist is folded away. */
  hidden: boolean;
}

export interface OnboardingProps {
  /** The person's first name, for the welcome. */
  name?: string | undefined;
  /** The setup steps, in order. Default: four steps for the demo workspace. */
  steps?: readonly SetupStep[] | undefined;
  /** Where it starts when nothing is saved yet. Default: nothing done, shown. */
  initial?: Partial<OnboardingState> | undefined;
  /** Keeps the state in localStorage under this key, so a reload or a later visit picks up where it was. */
  saveKey?: string | undefined;
  /** Called with each new state: save it on your server. */
  onChange?: ((state: OnboardingState) => void) | undefined;
  /** Where "Go to your dashboard" goes once every step is done. Default: "#dashboard". */
  dashboardHref?: string | undefined;
}

const demoSteps: SetupStep[] = [
  { id: 'profile', title: 'Add your photo and job title', description: 'Your team sees them next to everything you write.', action: { label: 'Edit your profile', href: '#profile' } },
  { id: 'team', title: 'Invite your team', description: 'Projects are more use with the people you work with.', action: { label: 'Invite people', href: '#invite' } },
  { id: 'project', title: 'Create your first project', description: 'A project holds tasks, files and the talk about them.', action: { label: 'Create a project', href: '#new-project' } },
  { id: 'notifications', title: 'Choose your notifications', description: 'Pick what reaches you by email and what waits in the app.', action: { label: 'Open notification settings', href: '#notifications' } },
];

function load(key: string | undefined): Partial<OnboardingState> | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<OnboardingState>) : null;
  } catch { return null; }
}
function save(key: string | undefined, state: OnboardingState) {
  if (!key) return;
  try { window.localStorage.setItem(key, JSON.stringify(state)); } catch { /* private mode or full: keeping it is a nicety */ }
}

/** The first-run page: a skip link, a header, then main with the welcome, the setup checklist and an empty project list. */
export function Onboarding({ name = 'Ada', steps = demoSteps, initial, saveKey, onChange, dashboardHref = '#dashboard' }: OnboardingProps) {
  const [state, setState] = React.useState<OnboardingState>(() => {
    const saved = load(saveKey) ?? initial ?? {};
    const ids = new Set(steps.map((s) => s.id));
    return { done: (saved.done ?? []).filter((id) => ids.has(id)), hidden: saved.hidden ?? false };
  });
  const update = (next: OnboardingState) => { setState(next); save(saveKey, next); onChange?.(next); };
  const count = (n: number) => `${n} of ${steps.length} steps done`;
  const finished = state.done.length === steps.length;

  const tick = (id: string, on: boolean) => {
    const done = steps.map((s) => s.id).filter((x) => (x === id ? on : state.done.includes(x)));
    update({ ...state, done });
    announce(done.length === steps.length ? `${count(done.length)}. You're all set.` : count(done.length));
  };

  // After hiding or showing, focus goes to what took the place of the button that was pressed.
  const showButton = React.useRef<HTMLButtonElement | null>(null);
  const heading = React.useRef<HTMLHeadingElement | null>(null);
  const moved = React.useRef(false);
  React.useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    (state.hidden ? showButton.current : heading.current)?.focus();
  }, [state.hidden]);
  const setHidden = (hidden: boolean) => { moved.current = true; update({ ...state, hidden }); };

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 outline-none">
        <div className="flex flex-col gap-2">
          <Heading level={1}>Welcome to Acme, {name}</Heading>
          <p className="m-0 text-text-muted">A few steps get your workspace ready. Do them in any order, now or later: we keep your place.</p>
        </div>

        <section aria-labelledby="setup-title" className="flex flex-col gap-4">
          {state.hidden ? (
            <Card padding="sm" className="flex flex-wrap items-center justify-between gap-3">
              <Heading level={2} id="setup-title" className="text-base">Set up your workspace: {count(state.done.length)}</Heading>
              <Button ref={showButton} variant="secondary" size="sm" onClick={() => setHidden(false)}>Show the checklist</Button>
            </Card>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Heading level={2} id="setup-title" ref={heading} tabIndex={-1} className="outline-none">Set up your workspace</Heading>
                <Button variant="ghost" size="sm" onClick={() => setHidden(true)}>Hide the checklist</Button>
              </div>
              <Progress label="Setup progress" value={state.done.length} max={steps.length} showValue tone={finished ? 'success' : 'primary'}
                formatValue={(v) => count(v)} />
              {finished ? (
                <Card>
                  <EmptyState icon="check_circle" headingLevel={3} title="You're all set"
                    description="Your workspace is ready. Everything here stays where you left it."
                    actions={<Button href={dashboardHref}>Go to your dashboard</Button>} />
                </Card>
              ) : null}
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {steps.map((s, i) => {
                  const done = state.done.includes(s.id);
                  return (
                    <Card as="li" key={s.id} padding="md" className="flex flex-col gap-3" aria-labelledby={`step-${s.id}`}>
                      <div className="flex flex-col gap-1">
                        <Heading level={3} id={`step-${s.id}`} className="text-base">
                          <span className="text-text-muted">{i + 1}. </span>{s.title}
                        </Heading>
                        <p className="m-0 text-sm text-text-muted">{s.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <Button href={s.action.href} variant={done ? 'secondary' : 'primary'} size="sm">{s.action.label}</Button>
                        <Checkbox checked={done} onCheckedChange={(on) => tick(s.id, on)} description={done ? 'Done' : 'To do'}>
                          Mark “{s.title}” as done
                        </Checkbox>
                      </div>
                    </Card>
                  );
                })}
              </ol>
            </>
          )}
        </section>

        <section aria-labelledby="projects-title" className="flex flex-col gap-4">
          <Heading level={2} id="projects-title">Your projects</Heading>
          <Card variant="filled">
            <EmptyState icon="folder_open" headingLevel={3} title="No projects yet"
              description="A project holds a piece of work: its tasks, its files and the talk about them. Start with one you're doing now."
              actions={<Button href="#new-project">Create a project</Button>} />
          </Card>
        </section>
      </main>
    </div>
  );
}
