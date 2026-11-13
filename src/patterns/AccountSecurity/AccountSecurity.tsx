'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Link } from '../../components/Link/Link';
import { Field } from '../../components/Field/Field';
import { PasswordInput } from '../../components/PasswordInput/PasswordInput';
import { PinInput } from '../../components/PinInput/PinInput';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { Dialog } from '../../components/Dialog/Dialog';
import { RelativeTime } from '../../components/RelativeTime/RelativeTime';
import { Toaster, toast } from '../../components/Toast/Toast';
import { TypeToConfirm } from '../../components/TypeToConfirm/TypeToConfirm';
import { Alert } from '../../components/Alert/Alert';
import type { ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import type { SaveState } from '../../components/SaveStatus/SaveStatus';
import { SettingsSection } from '../../blocks/SettingsSection/SettingsSection';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { Loader } from '../../components/Loader/Loader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';

/* Account security: changing the password, turning two-step verification on and off, and the devices signed in, each
   with Sign out. For an app to copy. What it carries (WCAG 2.2):
   - 3.3.8, 1.3.5: the password fields say what they hold (current-password, new-password), so password managers fill
     and suggest them, and paste works; the rules are shown before typing, not after a failure.
   - 3.3.1: problems are listed in an error summary that takes focus and links to each field.
   - 3.3.8: two-step setup shows the key as text with Copy beside the code box, not only a picture to scan, and the
     code box takes a pasted code and the one the phone offers (autocomplete one-time-code).
   - 3.3.4: recovery codes are shown once, with Copy, before setup ends; turning two-step off asks first.
   - 1.3.1, 2.4.6: each Sign out is named with its device ("Sign out of Firefox on a Windows PC"); the device in use says
     "This device" in words and has no Sign out.
   - 2.4.3, 4.1.3: after a sign-out, focus goes to the next device's Sign out (or the list's heading), and a toast says
     it's done.
   - 4.1.3, 3.3.3: while the devices load, their list is busy with placeholder rows, named once; a failed load says so
     in their place, with Try again (EmptyLoadFailed). The rest of the page works meanwhile.
   - 3.3.4: deleting the account sits apart at the end, offers the data first, says what will be lost, and asks for the
     account's email before its button works; a delete that fails says so in the dialog, which stays open. After it,
     focus goes to the h1 of the page that says it's done.
   Checking passwords and codes, ending sessions and deleting the account are the app's job: the on* props get them. */

export interface SignedInDevice {
  id: string;
  /** "Firefox on a Windows PC". */
  name: string;
  /** "Jakarta, Indonesia". */
  place: string;
  /** When it was last used: a Date, a time in ms, or an ISO string. */
  lastActive: Date | number | string;
  current?: boolean | undefined;
}

export interface AccountSecurityProps {
  /** Two-step verification is on at first. Default: false. */
  twoStep?: boolean | undefined;
  /** The key to add to an authenticator app, shown during setup. Default: a demo key. */
  setupKey?: string | undefined;
  /** The recovery codes shown once setup is done. Default: demo codes. */
  recoveryCodes?: readonly string[] | undefined;
  /** The devices signed in, the one in use first. Default: three demo devices. */
  devices?: readonly SignedInDevice[] | undefined;
  /** Change password was pressed with no problems left. Return its promise: a rejection says it couldn't be saved. */
  onChangePassword?: ((current: string, next: string) => unknown) | undefined;
  /** A 6-digit code was entered during setup. Return its promise: a rejection says the code didn't work. */
  onEnableTwoStep?: ((code: string) => unknown) | undefined;
  /** Turning two-step verification off was confirmed. */
  onDisableTwoStep?: (() => void) | undefined;
  /** Sign out was pressed for one device. */
  onSignOut?: ((id: string) => void) | undefined;
  /** Sign out everywhere else was pressed. */
  onSignOutOthers?: (() => void) | undefined;
  /** The account's email, typed to confirm deleting it. Default: "ana@example.com". */
  email?: string | undefined;
  /** Where "Download your data" leads. Default: "#export". */
  dataHref?: string | undefined;
  /** The email was typed and Delete pressed. Return its promise: a rejection keeps the dialog open and says so. */
  onDeleteAccount?: (() => unknown) | undefined;
  /** The devices are on their way: placeholder rows, named once ("Loading where you’re signed in"). Default: false. */
  loading?: boolean | undefined;
  /** The devices failed to load: a "Couldn’t load where you’re signed in" message with Try again, which calls onRetry, in their place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads the devices again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const MIN = 12;
const now = Date.now();
const demoDevices: SignedInDevice[] = [
  { id: 'd1', name: 'Chrome on a Mac', place: 'Jakarta, Indonesia', lastActive: now, current: true },
  { id: 'd2', name: 'Safari on an iPhone', place: 'Jakarta, Indonesia', lastActive: now - 3 * 3600_000 },
  { id: 'd3', name: 'Firefox on a Windows PC', place: 'Bandung, Indonesia', lastActive: now - 6 * 86400_000 },
];
const demoCodes = ['4f7k-2m9q', 'x8p3-n6tz', 'h2c5-w7rb', 'q9d4-j3vy', 'm6s8-k2fe', 't3g7-r5xa'];

/** What's wrong with a password change, in the order of its fields. */
export function passwordProblems(current: string, next: string): ErrorSummaryItem[] {
  const found: ErrorSummaryItem[] = [];
  if (!current) found.push({ field: 'password-current', message: 'Enter your current password' });
  if (next.length < MIN) found.push({ field: 'password-new', message: `Make the new password at least ${MIN} characters` });
  else if (next === current) found.push({ field: 'password-new', message: 'Choose a new password, not the one you have now' });
  return found;
}

/** The security page: a skip link, a header with the way back, then main with the h1 and a section per part. */
export function AccountSecurity({ twoStep: on0 = false, setupKey = 'JBSW Y3DP EHPK 3PXP', recoveryCodes = demoCodes, devices = demoDevices,
  onChangePassword, onEnableTwoStep, onDisableTwoStep, onSignOut, onSignOutOthers, email = 'ana@example.com', dataHref = '#export', onDeleteAccount, loading = false, loadFailed = false, onRetry }: AccountSecurityProps) {
  // Password
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [status, setStatus] = React.useState<SaveState>('idle');
  const [savedAt, setSavedAt] = React.useState<number | undefined>(undefined);
  const err = (f: string) => errors.find((e) => e.field === f)?.message;
  const save = () => {
    const found = passwordProblems(current, next);
    setErrors(found);
    if (found.length) { setStatus('idle'); return; }
    setStatus('saving');
    void Promise.resolve().then(() => onChangePassword?.(current, next)).then(() => {
      setCurrent(''); setNext(''); setSavedAt(Date.now()); setStatus('saved');
    }, () => setStatus('error'));
  };

  // Two-step verification: setting up is a code step, then the recovery codes.
  const [on, setOn] = React.useState(on0);
  const [setup, setSetup] = React.useState<'closed' | 'code' | 'codes'>('closed');
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);
  const [asking, setAsking] = React.useState(false);
  const twoStepButton = React.useRef<HTMLButtonElement>(null);
  const openSetup = (o: boolean) => {
    if (o) { setCode(''); setCodeError(null); setSetup('code'); return; }
    // Closing after the codes were shown ends setup; closing before it leaves two-step off.
    if (setup === 'codes') toast({ title: 'Two-step verification is on', tone: 'success' });
    setSetup('closed');
  };
  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setCodeError('Enter the 6-digit code from your authenticator app.'); return; }
    setChecking(true);
    void Promise.resolve().then(() => onEnableTwoStep?.(code)).then(() => { setOn(true); setSetup('codes'); },
      () => {
        // The old code is no use any more: the boxes clear, ready for the next one.
        setCode('');
        setCodeError('That code didn’t work. Check that your phone’s clock is right, then enter the newest code.');
        requestAnimationFrame(() => document.getElementById('two-step-code')?.focus());
      })
      .finally(() => setChecking(false));
  };
  const turnOff = () => { setOn(false); setAsking(false); onDisableTwoStep?.(); toast({ title: 'Two-step verification is off' }); };

  // Devices
  const [gone, setGone] = React.useState<ReadonlySet<string>>(new Set());
  const devicesHeading = React.useRef<HTMLHeadingElement>(null);
  const shown = devices.filter((d) => !gone.has(d.id));
  const others = shown.filter((d) => !d.current);
  const signOut = (d: SignedInDevice) => {
    const at = others.indexOf(d), after = others[at + 1] ?? others[at - 1];
    setGone((g) => new Set(g).add(d.id));
    onSignOut?.(d.id);
    toast({ title: `Signed out of ${d.name}` });
    requestAnimationFrame(() => (after ? document.getElementById(`sign-out-${after.id}`)?.focus() : devicesHeading.current?.focus()));
  };
  const signOutOthers = () => {
    setGone(new Set(others.map((d) => d.id)));
    onSignOutOthers?.();
    toast({ title: others.length === 1 ? 'Signed out of 1 other device' : `Signed out of ${others.length} other devices` });
    requestAnimationFrame(() => devicesHeading.current?.focus());
  };

  // Deleting the account: a dialog that asks for the email, then a page that says it's done.
  const [deleting, setDeleting] = React.useState(false);
  const [deleteFailed, setDeleteFailed] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const goneHeading = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => { if (deleted) goneHeading.current?.focus(); }, [deleted]);
  const askDelete = (o: boolean) => { setDeleting(o); if (!o) setDeleteFailed(false); };
  // The promise goes back to the button, which shows it's busy while a slow delete runs.
  const deleteAccount = () => {
    setDeleteFailed(false);
    return Promise.resolve().then(() => onDeleteAccount?.()).then(() => { setDeleting(false); setDeleted(true); }, () => setDeleteFailed(true));
  };

  const part = 'grid grid-cols-1 gap-4 border-b border-border py-6 md:grid-cols-3 md:gap-8';
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link href="#settings">Back to settings</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-4xl flex-col px-4 py-8 outline-none">
        {deleted ? (
          <div className="flex flex-col gap-3">
            <Heading level={1} ref={goneHeading} tabIndex={-1} className="outline-none">Your account is deleted</Heading>
            <p className="m-0 text-text-muted">Your projects, files and settings are gone, and you’re signed out everywhere.</p>
            <Link href="#home">Go to the home page</Link>
          </div>
        ) : <>
        <PageHeader title="Security" />

        <SettingsSection title="Password" description={`At least ${MIN} characters. A long phrase is easier to remember than symbols.`}
          onSave={save} errors={errors} status={status} savedAt={savedAt} onRetry={save} saveLabel="Change password">
          <Field label="Current password" id="password-current" error={err('password-current')} required>
            <PasswordInput name="current-password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="New password" id="password-new" hint={`At least ${MIN} characters.`} error={err('password-new')} required>
            <PasswordInput name="new-password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
        </SettingsSection>

        <section aria-labelledby="two-step" className={part}>
          <div className="flex flex-col gap-1">
            <Heading level={2} size="lg" id="two-step">Two-step verification</Heading>
            <p className="m-0 text-sm text-text-muted">A code from an app on your phone, as well as your password, when you sign in on a new device.</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:col-span-2">
            <p className="m-0">{on ? <><Badge tone="success">On</Badge> With an authenticator app.</> : <><Badge>Off</Badge> Only your password protects this account.</>}</p>
            {on ? <Button ref={twoStepButton} variant="outline" onClick={() => setAsking(true)}>Turn off</Button>
              : <Button ref={twoStepButton} onClick={() => openSetup(true)}>Turn on</Button>}
          </div>
        </section>

        <section aria-labelledby="devices" className={part}>
          <div className="flex flex-col gap-1">
            <Heading level={2} size="lg" id="devices" ref={devicesHeading} tabIndex={-1} className="outline-none">Where you’re signed in</Heading>
            <p className="m-0 text-sm text-text-muted">If you don’t know a device, sign it out and change your password.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 md:col-span-2">
            {loadFailed ? <EmptyLoadFailed title="Couldn’t load where you’re signed in" onRetry={() => onRetry?.()} headingLevel={3} /> : loading ? (
              // One name for all of them: the first row is named, the others are only pictures.
              <ul role="list" aria-busy="true" className="m-0 flex list-none flex-col divide-y divide-border p-0">
                {[0, 1, 2].map((i) => <li key={i} className="py-3"><Loader variant="skeleton" shape="text" size="sm" lines={2} label={i === 0 ? 'Loading where you’re signed in' : ''} /></li>)}
              </ul>
            ) : <>
            <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
              {shown.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium">{d.name}{d.current ? <Badge tone="primary" className="ms-2">This device</Badge> : null}</span>
                    <span className="text-sm text-text-muted">{d.place}, {d.current ? 'active now' : <>last active <RelativeTime date={d.lastActive} /></>}</span>
                  </div>
                  {d.current ? null : <Button id={`sign-out-${d.id}`} size="sm" variant="outline" aria-label={`Sign out of ${d.name}`} onClick={() => signOut(d)}>Sign out</Button>}
                </li>
              ))}
            </ul>
            {others.length > 1 ? <Button variant="outline" className="self-start" onClick={signOutOthers}>Sign out everywhere else</Button> : null}
            </>}
          </div>
        </section>

        <section aria-labelledby="delete-account" className={part}>
          <div className="flex flex-col gap-1">
            <Heading level={2} size="lg" id="delete-account">Delete your account</Heading>
            <p className="m-0 text-sm text-text-muted">This can’t be undone.</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:col-span-2">
            <p className="m-0 max-w-prose">Deleting removes your projects, files and settings for good, and signs you out everywhere. Download your data first if you want to keep a copy.</p>
            <div className="flex flex-wrap gap-2">
              <Button href={dataHref} variant="outline">Download your data</Button>
              <Button variant="outline" destructive onClick={() => askDelete(true)}>Delete account</Button>
            </div>
          </div>
        </section>

        <Dialog open={setup !== 'closed'} onOpenChange={openSetup} finalFocus={twoStepButton}
          title={setup === 'codes' ? 'Save your recovery codes' : 'Turn on two-step verification'}
          description={setup === 'codes'
            ? 'If you lose your phone, each of these signs you in once. Keep them somewhere safe: they’re shown only now.'
            : 'Add this key to your authenticator app, by typing or pasting it, then enter the 6-digit code the app shows.'}>
          {setup === 'codes' ? (
            <div className="flex flex-col gap-4">
              <ul aria-label="Recovery codes" className="m-0 grid list-none grid-cols-2 gap-2 p-0 font-mono">
                {recoveryCodes.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={recoveryCodes.join('\n')} copiedLabel="Copied">Copy the codes</CopyButton>
                <Button onClick={() => openSetup(false)}>I’ve saved them</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={verify} noValidate className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono" id="setup-key">{setupKey}</span>
                <CopyButton value={setupKey.replace(/\s/g, '')} copiedLabel="Copied" aria-describedby="setup-key">Copy the key</CopyButton>
              </div>
              <Field label="6-digit code" error={codeError ?? undefined}>
                <PinInput id="two-step-code" name="code" length={6} autoComplete="one-time-code" type="numeric" value={code} invalid={!!codeError} onValueChange={(v) => { setCode(v); if (codeError) setCodeError(null); }} />
              </Field>
              <Button type="submit" className="self-start" loading={checking}>Turn on</Button>
            </form>
          )}
        </Dialog>

        <Dialog alert open={asking} onOpenChange={setAsking} title="Turn off two-step verification?"
          description="Then only your password protects this account. You can turn it on again at any time.">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setAsking(false)}>Keep it on</Button>
            <Button variant="outline" destructive onClick={turnOff}>Turn off</Button>
          </div>
        </Dialog>

        <Dialog alert open={deleting} onOpenChange={askDelete} title="Delete your account?"
          description="This deletes your projects, files and settings for good. It can’t be undone.">
          <div className="flex flex-col gap-4">
            {deleteFailed ? <Alert tone="danger">Couldn’t delete your account. Try again.</Alert> : null}
            <TypeToConfirm phrase={email} confirmLabel="Delete my account" onConfirm={deleteAccount} />
          </div>
        </Dialog>
        </>}
      </main>
      <Toaster />
    </div>
  );
}
