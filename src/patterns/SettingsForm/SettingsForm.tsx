'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Link } from '../../components/Link/Link';
import { Loader } from '../../components/Loader/Loader';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { Select } from '../../components/Select/Select';
import { Switch } from '../../components/Switch/Switch';
import { useUnsavedChanges } from '../../components/Dialog/Dialog';
import type { ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import type { SaveState } from '../../components/SaveStatus/SaveStatus';
import { SettingsSection } from '../../blocks/SettingsSection/SettingsSection';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Settings form: a settings page of sections, each with its own Save, errors and status, and a question before
   unsaved changes are lost. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: each section is a region named by its heading; the switches are real checkboxes (role="switch") with
     their own labels and descriptions.
   - 3.3.1, 3.3.3: a Save with problems shows an ErrorSummary at the top of that section, which takes focus and links
     to each field, and each field says what to write ("Enter an email address, like name@example.com").
   - 4.1.3: SaveStatus says "Saved" politely when a save finishes, or "Couldn't save" with Try again, without moving
     focus.
   - 3.2.2: nothing saves on its own. Each section waits for its own Save, so a change in one never saves another.
   - 3.3.4-ish: leaving with unsaved changes (the "Back to the dashboard" link, or closing the tab) asks "Discard
     changes?" first, with Keep editing focused (useUnsavedChanges).
   Storing the settings is the app's job: `onSave` gets each section's values. */

export interface Profile { name: string; email: string; bio: string; timeZone: string }
export interface Notifications { comments: boolean; summary: boolean; news: boolean }
export interface SettingsValues { profile: Profile; notifications: Notifications }

export interface SettingsFormProps {
  /** The settings as saved. Default: a demo account. */
  initial?: SettingsValues | undefined;
  /** Saves one section. A rejected promise shows "Couldn't save" with Try again. */
  onSave?: (<K extends keyof SettingsValues>(section: K, values: SettingsValues[K]) => void | Promise<unknown>) | undefined;
  /** "Back to the dashboard" was followed, after any unsaved changes were discarded: go there. */
  onLeave?: (() => void) | undefined;
  /** The saved settings are on their way: each section shows placeholder fields, and the form starts from `initial` once
      they're in. Default: false. */
  loading?: boolean | undefined;
  /** The saved settings failed to load: a "Couldn’t load your settings" message with Try again, which calls onRetry, in
      place of the sections. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demo: SettingsValues = {
  profile: { name: 'Ada Lovelace', email: 'ada@example.com', bio: '', timeZone: 'Europe/London' },
  notifications: { comments: true, summary: true, news: false },
};
const ZONES = [
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC−8)' }, { value: 'America/New_York', label: 'New York (UTC−5)' },
  { value: 'Europe/London', label: 'London (UTC+0)' }, { value: 'Europe/Berlin', label: 'Berlin (UTC+1)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (UTC+7)' }, { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
];
const BIO_MAX = 160;
const id = (k: keyof Profile) => `profile-${k}`;

/** What's wrong with the profile, in the order of its fields. */
export function profileProblems(p: Profile): ErrorSummaryItem[] {
  const rules: [keyof Profile, boolean, string][] = [
    ['name', !p.name.trim(), 'Enter your name, as your team should see it'],
    ['email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()), 'Enter an email address, like name@example.com'],
    ['bio', p.bio.length > BIO_MAX, `Shorten your bio to ${BIO_MAX} characters or fewer`],
  ];
  return rules.filter(([, bad]) => bad).map(([k, , message]) => ({ field: id(k), message }));
}

/** One section's draft, saved copy, errors and save status. */
function useSection<K extends keyof SettingsValues>(key: K, saved0: SettingsValues[K], check: (v: SettingsValues[K]) => ErrorSummaryItem[],
  onSave: SettingsFormProps['onSave']) {
  const [draft, setDraft] = React.useState(saved0);
  const [saved, setSaved] = React.useState(saved0);
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [status, setStatus] = React.useState<SaveState>('idle');
  const [savedAt, setSavedAt] = React.useState<number | undefined>(undefined);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const save = async () => {
    const found = check(draft);
    setErrors(found);
    if (found.length) { setStatus('idle'); return; }
    setStatus('saving');
    try {
      await onSave?.(key, draft);
      setSaved(draft);
      setSavedAt(Date.now());
      setStatus('saved');
    } catch { setStatus('error'); }
  };
  const set = (patch: Partial<SettingsValues[K]>) => { setDraft({ ...draft, ...patch }); if (status === 'saved') setStatus('idle'); };
  return { draft, set, dirty, errors, status, savedAt, save: () => void save() };
}

/** The settings page: a skip link, a header with the way back, then main with the h1 and a section per group. */
export function SettingsForm({ loading = false, loadFailed = false, onRetry, ...props }: SettingsFormProps) {
  // The form takes `initial` when it mounts, so it mounts once the settings are in, not before.
  return loading || loadFailed ? <Loading failed={loadFailed} onRetry={onRetry} /> : <Loaded {...props} />;
}

// While the settings load: the same page, with a busy placeholder per section, named once ("Loading settings"). When
// they failed to load: the page says so in the sections' place, with Try again.
function Loading({ failed, onRetry }: { failed: boolean; onRetry: SettingsFormProps['onRetry'] }) {
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link href="#dashboard">Back to the dashboard</Link>
      </header>
      <main id="main" aria-busy={failed ? undefined : true} className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 outline-none">
        <PageHeader title="Settings" />
        {failed ? <EmptyLoadFailed title="Couldn’t load your settings" onRetry={() => onRetry?.()} headingLevel={2} /> : ['Profile', 'Notifications'].map((t, i) => (
          <section key={t} aria-labelledby={'settings-loading-' + i} className="flex flex-col gap-3">
            <Heading level={2} size="lg" id={'settings-loading-' + i}>{t}</Heading>
            <Loader variant="skeleton" shape="text" lines={i === 0 ? 6 : 3} label={i === 0 ? 'Loading settings' : ''} />
          </section>
        ))}
      </main>
    </div>
  );
}

function Loaded({ initial = demo, onSave, onLeave }: Omit<SettingsFormProps, 'loading' | 'loadFailed' | 'onRetry'>) {
  const profile = useSection('profile', initial.profile, profileProblems, onSave);
  const notes = useSection('notifications', initial.notifications, () => [], onSave);
  const { confirm, dialog } = useUnsavedChanges(profile.dirty || notes.dirty);
  const p = profile.draft;
  const n = notes.draft;
  const err = (k: keyof Profile) => profile.errors.find((e) => e.field === id(k))?.message;

  const leave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (await confirm()) onLeave?.();
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link href="#dashboard" onClick={(e) => void leave(e)}>Back to the dashboard</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        <PageHeader title="Settings" />
        <SettingsSection title="Profile" description="How you appear to your team." onSave={profile.save}
          errors={profile.errors} status={profile.status} savedAt={profile.savedAt} onRetry={profile.save} saveLabel="Save profile">
          <Field label="Name" error={err('name')} required>
            <Input id={id('name')} name="name" autoComplete="name" value={p.name} onChange={(e) => profile.set({ name: e.target.value })} />
          </Field>
          <Field label="Email" hint="Where we send your notifications." error={err('email')} required>
            <Input id={id('email')} name="email" type="email" autoComplete="email" spellCheck={false} value={p.email}
              onChange={(e) => profile.set({ email: e.target.value })} />
          </Field>
          <Field label="Bio" hint={`A line about you, up to ${BIO_MAX} characters.`} error={err('bio')} optional>
            <Textarea id={id('bio')} name="bio" rows={3} showCount maxLength={BIO_MAX} value={p.bio} onChange={(e) => profile.set({ bio: e.target.value })} />
          </Field>
          <Field label="Time zone" hint="For the times on comments and the weekly summary.">
            <Select id={id('timeZone')} name="timeZone" value={p.timeZone} options={ZONES} onChange={(e) => profile.set({ timeZone: e.target.value })} />
          </Field>
        </SettingsSection>
        <SettingsSection title="Notifications" description="What reaches you by email. Everything is in the app either way."
          onSave={notes.save} status={notes.status} savedAt={notes.savedAt} onRetry={notes.save} saveLabel="Save notifications">
          <Switch checked={n.comments} onCheckedChange={(on) => notes.set({ comments: on })} description="When someone replies to you or mentions you.">Comments</Switch>
          <Switch checked={n.summary} onCheckedChange={(on) => notes.set({ summary: on })} description="Every Monday: what changed in your projects.">Weekly summary</Switch>
          <Switch checked={n.news} onCheckedChange={(on) => notes.set({ news: on })} description="New features, at most once a month.">Product news</Switch>
        </SettingsSection>
        {dialog}
      </main>
    </div>
  );
}
