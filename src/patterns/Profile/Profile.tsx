'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Avatar } from '../../components/Avatar/Avatar';
import { Card } from '../../components/Card/Card';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { SaveStatus, type SaveState } from '../../components/SaveStatus/SaveStatus';
import { Loader } from '../../components/Loader/Loader';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';

/* Profile: what other people see of you (a photo, your name, a short bio, where you are and a link), edited in one
   form and saved when you say so. For an app to copy. What it carries (WCAG 2.2):
   - 1.1.1: the photo's preview says whose it is; without a photo, the avatar shows initials and still names you.
   - 3.3.2, 1.3.5: each field says what it's for and its limits: the bio counts what's left as you type, the photo
     says which files and how big; name and link say what they are for autofill.
   - 3.3.1, 2.4.3: a missing name, or a link that isn't one, is said in a summary that takes focus when you save, each
     a link to its field, which says it too. A photo that's too big or not an image is said by the upload itself.
   - 4.1.3: Save says where it's got to (Saving, Saved, or a failure with Try again) in a status that's read out.
   - 3.3.4: Discard changes is there only once something has changed, and puts back what was saved.
   - 2.4.6: the form's heading says whose profile it is, and its preview shows the result as others will see it.
   - 4.1.3, 3.3.1: while the profile loads, a placeholder named once; a failed load says so, with Try again.
   Saving is the app's job: onSave gets the profile and the new photo, if any; reject its promise when it fails. */

export interface ProfileInfo {
  name: string;
  /** A sentence or two about you. */
  bio: string;
  /** Where you are: "Bandung, Indonesia". */
  location: string;
  /** A link to your site, or empty. */
  website: string;
  /** The photo's address, or empty for initials. */
  photo: string;
}

export interface ProfileProps {
  /** The profile as saved. Default: a demo profile. */
  profile?: ProfileInfo | undefined;
  /** The bio's limit, in characters. Default: 160. */
  bioLimit?: number | undefined;
  /** Saves the profile. Return its promise: a rejection keeps the changes and offers Try again. */
  onSave?: ((profile: ProfileInfo, photo: File | null) => unknown) | undefined;
  /** The profile is on its way from the server: placeholders, named once ("Loading profile"). Default: false. */
  loading?: boolean | undefined;
  /** The profile failed to load: a message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the profile again, after a failed load. */
  onRetry?: (() => void) | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demo: ProfileInfo = { name: 'Ana Lima', bio: 'Product designer. I draw interfaces, maps and the odd cat.', location: 'Bandung, Indonesia', website: 'https://ana.example.com', photo: '' };

/** What's wrong with the profile, by field, or {} when it can be saved. */
export function profileProblems(p: Pick<ProfileInfo, 'name' | 'website' | 'bio'>, bioLimit = 160): Partial<Record<'name' | 'website' | 'bio', string>> {
  const out: Partial<Record<'name' | 'website' | 'bio', string>> = {};
  if (!p.name.trim()) out.name = 'Enter your name.';
  const link = p.website.trim();
  if (link && !/^https?:\/\/[^\s.]+\.[^\s]+$/.test(link)) out.website = 'Enter a link that starts with https://, like https://example.com.';
  if (p.bio.length > bioLimit) out.bio = `Shorten your bio to ${bioLimit} characters.`;
  return out;
}

/** Whether two profiles differ in anything a person typed. */
export const profileChanged = (a: ProfileInfo, b: ProfileInfo): boolean =>
  a.name !== b.name || a.bio !== b.bio || a.location !== b.location || a.website !== b.website || a.photo !== b.photo;

/** The profile page: a skip link, a header, then main with the h1, the form and a preview. */
/** The fields that can have a problem, in the order they show. */
const PARTS = ['name', 'bio', 'website'] as const;

export function Profile({ profile: start = demo, bioLimit = 160, onSave, loading = false, loadFailed = false, onRetry, online }: ProfileProps) {
  const [saved, setSaved] = React.useState(start);
  const [draft, setDraft] = React.useState(start);
  // What the app passes once loading ends replaces what was there, which was empty or the demo.
  const [wasLoading, setWasLoading] = React.useState(loading);
  if (wasLoading !== loading) { setWasLoading(loading); if (!loading) { setSaved(start); setDraft(start); } }
  const [files, setFiles] = React.useState<File[]>([]);
  const [problems, setProblems] = React.useState<ReturnType<typeof profileProblems>>({});
  const [tries, setTries] = React.useState(0);
  const [status, setStatus] = React.useState<SaveState>('idle');
  const [savedAt, setSavedAt] = React.useState<Date | undefined>(undefined);
  // The new photo's preview: an object URL made once per file, and let go when the file changes or the page goes.
  const preview = React.useMemo(() => (files[0] ? URL.createObjectURL(files[0]) : ''), [files]);
  React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const photo = preview || draft.photo;
  const dirty = profileChanged(draft, saved) || files.length > 0;

  const edit = (patch: Partial<ProfileInfo>) => {
    setDraft((now) => ({ ...now, ...patch }));
    if (status !== 'saving') setStatus('idle');
  };
  const discard = () => { setDraft(saved); setFiles([]); setProblems({}); setStatus('idle'); };
  const errors: ErrorSummaryItem[] = PARTS.filter((k) => problems[k]).map((k) => ({ field: `profile-${k}`, message: problems[k] }));
  const save = (e?: React.FormEvent) => {
    e?.preventDefault();
    const found = profileProblems(draft, bioLimit);
    setProblems(found);
    setTries((t) => t + 1);
    if (PARTS.some((k) => found[k])) return;
    const sent = { ...draft, name: draft.name.trim(), location: draft.location.trim(), website: draft.website.trim() };
    setStatus('saving');
    void Promise.resolve().then(() => onSave?.(sent, files[0] ?? null)).then(() => {
      const next = { ...sent, photo: preview || sent.photo };
      setSaved(next);
      setDraft(next);
      setFiles([]);
      setSavedAt(new Date());
      setStatus('saved');
    }, () => setStatus('error'));
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col px-4 py-8 outline-none">
        <OfflineBanner online={online} placement="inline" className="mb-6">Your changes stay here. Saving them needs a connection.</OfflineBanner>
        <PageHeader breadcrumb={[{ label: 'Settings', href: '#settings' }, { label: 'Profile' }]} title="Profile"
          description="What other people see of you." />

        <div className="pt-6">
          {loadFailed ? <EmptyLoadFailed title="Couldn’t load your profile" onRetry={() => onRetry?.()} headingLevel={2} />
            : loading ? <Card><Loader variant="skeleton" shape="text" lines={6} label="Loading profile" /></Card> : (
              <div className="grid items-start gap-6 md:grid-cols-3">
                <form onSubmit={save} noValidate aria-labelledby="edit" className="flex flex-col gap-4 md:col-span-2">
                  <h2 id="edit" className="m-0 text-lg font-semibold">Edit {saved.name ? `${saved.name}’s` : 'your'} profile</h2>
                  <ErrorSummary key={tries} errors={errors} headingLevel={3} />
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar size="xl" name={draft.name || saved.name} src={photo || undefined} alt={photo ? `Photo of ${draft.name || saved.name}` : undefined} />
                    {draft.photo && !files.length ? <Button variant="outline" size="sm" onClick={() => edit({ photo: '' })}>Remove photo</Button> : null}
                  </div>
                  <Field label="Photo" hint="A square JPEG or PNG works best, up to 2 MB." optional>
                    <FileUpload id="profile-photo" accept="image/png,image/jpeg,image/webp" maxSize={2 * 1024 * 1024} files={files} onFilesChange={(f) => { setFiles(f.slice(-1)); if (status !== 'saving') setStatus('idle'); }} />
                  </Field>
                  <Field label="Name" id="profile-name" error={problems.name} required>
                    <Input autoComplete="name" value={draft.name} onChange={(e) => edit({ name: e.target.value })} />
                  </Field>
                  <Field label="Bio" id="profile-bio" hint={`Up to ${bioLimit} characters.`} error={problems.bio} optional>
                    <Textarea rows={3} maxLength={bioLimit} showCount value={draft.bio} onChange={(e) => edit({ bio: e.target.value })} />
                  </Field>
                  <Field label="Location" optional>
                    <Input autoComplete="address-level2" value={draft.location} onChange={(e) => edit({ location: e.target.value })} />
                  </Field>
                  <Field label="Website" id="profile-website" error={problems.website} optional>
                    <Input type="url" autoComplete="url" inputMode="url" value={draft.website} onChange={(e) => edit({ website: e.target.value })} />
                  </Field>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" loading={status === 'saving'}>Save profile</Button>
                    {dirty && status !== 'saving' ? <Button variant="outline" onClick={discard}>Discard changes</Button> : null}
                    <SaveStatus status={status} savedAt={savedAt} onRetry={() => save()} />
                  </div>
                  {status === 'error' ? <Alert tone="danger">Couldn’t save your profile. Your changes are still here.</Alert> : null}
                </form>
                <Card>
                  <section aria-labelledby="preview" className="flex flex-col items-start gap-4">
                    <h2 id="preview" className="m-0 text-lg font-semibold">How others see it</h2>
                    <Avatar size="lg" name={draft.name || saved.name} src={photo || undefined} alt="" />
                    <p className="m-0 text-base font-semibold">{draft.name.trim() || 'Your name'}</p>
                    {draft.bio ? <p className="m-0 wrap-break-word">{draft.bio}</p> : null}
                    {draft.location.trim() ? <p className="m-0 text-sm text-text-muted">{draft.location.trim()}</p> : null}
                    {draft.website.trim() && !profileProblems(draft, bioLimit).website ? <p className="m-0 text-sm wrap-break-word">{draft.website.trim().replace(/^https?:\/\//, '')}</p> : null}
                  </section>
                </Card>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
