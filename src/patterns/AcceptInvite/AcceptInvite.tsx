'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Avatar } from '../../components/Avatar/Avatar';
import { AvatarGroup } from '../../components/AvatarGroup/AvatarGroup';
import { Card } from '../../components/Card/Card';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Link } from '../../components/Link/Link';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { FormattedDate } from '../../components/FormattedDate/FormattedDate';
import { useLocale } from '../../internal/provider';

/* Accept invite: the page a workspace invite links to. Who invited you, to what, as what, and Join or Decline; or
   why it can't be used any more and what to do. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: who invited you is the first thing said, in the h1; the workspace, your role and when the invite ends are
     named facts, so nothing hangs on a picture.
   - 1.1.1: the members' pictures are one named group, each picture named by its person, with how many in words.
   - 3.3.4: the account you'd join with is said, with a way to switch, before Join, as the address the invite went to
     may not be the one signed in; a mismatch says so in words.
   - 3.3.4, 4.1.3: Join shows it's busy; one that fails says so next to the buttons and changes nothing.
   - 2.4.3: after Join or Decline, the answer's heading takes focus and says what happened, with where to go.
   - An invite that has ended or been used says why in the h1, and who to ask, rather than a bare error.
   Joining and declining are the app's: onJoin and onDecline; reject onJoin when it can't. */

export interface WorkspaceInvite {
  from: string;
  workspace: string;
  role: string;
  /** What the role can do, in a sentence: "Edit files and invite people". */
  roleCan: string;
  /** The address the invite was sent to. */
  email: string;
  /** Members' names, for the pictures. */
  members: string[];
  /** When it ends: an ISO date and time. */
  expires: string;
  /** Used already. */
  used?: boolean | undefined;
}

export type InviteState = 'open' | 'ended' | 'used';

export interface AcceptInviteProps {
  /** The invite. Default: a demo invite. */
  invite?: WorkspaceInvite | undefined;
  /** The account signed in. Default: the address the invite went to. */
  signedInAs?: string | undefined;
  /** Now, for whether it has ended. Default: the time it renders. */
  now?: Date | undefined;
  /** Joins. Reject when it can't. */
  onJoin?: (() => unknown) | undefined;
  /** Declines. */
  onDecline?: (() => void) | undefined;
}

const demo: WorkspaceInvite = {
  from: 'Dewi Lestari', workspace: 'Acme Design', role: 'Editor', roleCan: 'Edit files and comment; only admins invite people or change billing.',
  email: 'ana@example.com', members: ['Dewi Lestari', 'Chen Wei', 'Eko Prasetyo', 'Sara Haddad', 'Lena Vogel', 'Tomás Ruiz', 'Kofi Mensah'],
  expires: '2099-03-20T17:00:00Z',
};

/** Whether the invite can still be used. */
export function inviteState(invite: WorkspaceInvite, now: Date): InviteState {
  if (invite.used) return 'used';
  return new Date(invite.expires).getTime() <= now.getTime() ? 'ended' : 'open';
}

/** The invite page: a skip link, a header, then main with the invite, or why it can't be used, or the answer. */
export function AcceptInvite({ invite = demo, signedInAs = invite.email, now, onJoin, onDecline }: AcceptInviteProps) {
  const locale = useLocale();
  const state = inviteState(invite, now ?? new Date());
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [done, setDone] = React.useState<'joined' | 'declined' | null>(null);
  const answer = React.useRef<HTMLHeadingElement>(null);
  const other = signedInAs.toLowerCase() !== invite.email.toLowerCase();
  const ends = <FormattedDate value={invite.expires} dateStyle="long" timeStyle="short" />;
  const shown = invite.members.slice(0, 4);

  const join = () => {
    setFailed(false);
    setBusy(true);
    void Promise.resolve().then(() => onJoin?.()).then(() => setDone('joined'), () => setFailed(true)).finally(() => setBusy(false));
  };
  const decline = () => { onDecline?.(); setDone('declined'); };
  React.useEffect(() => { if (done) answer.current?.focus(); }, [done]);

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#help">Help</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-lg flex-col px-4 py-12 outline-none">
        <Card padding="lg" className="flex flex-col gap-4">
          {done ? (
            <section aria-labelledby="invite-answer" className="flex flex-col items-start gap-3">
              <h1 id="invite-answer" ref={answer} tabIndex={-1} className="m-0 text-2xl font-semibold outline-none">
                {done === 'joined' ? `You’ve joined ${invite.workspace}` : 'Invite declined'}
              </h1>
              <p className="m-0">{done === 'joined' ? `Your role is ${invite.role}. ${invite.from} can see you’ve joined.` : `${invite.from} won’t be told. If you change your mind, ask them for a new invite.`}</p>
              <Link href={done === 'joined' ? '#workspace' : '#home'}>{done === 'joined' ? `Open ${invite.workspace}` : 'Go to your home page'}</Link>
            </section>
          ) : state !== 'open' ? (
            <>
              <h1 className="m-0 text-2xl font-semibold">{state === 'used' ? 'This invite has been used' : 'This invite has ended'}</h1>
              <p className="m-0">
                {state === 'used' ? `Someone has already joined ${invite.workspace} with it. If that was you, sign in to open it.` : <>Invites last 7 days, and this one ended on {ends}.</>}
                {' '}Ask {invite.from} for a new one if you still need to join.
              </p>
              {state === 'used' ? <Link href="#sign-in">Sign in</Link> : null}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Avatar name={invite.from} size="lg" />
                <h1 className="m-0 text-2xl font-semibold">{invite.from} invited you to join {invite.workspace}</h1>
              </div>
              <DescriptionList>
                <DescriptionItem term="Your role">{invite.role}: {invite.roleCan}</DescriptionItem>
                <DescriptionItem term="Members">
                  <span className="flex flex-wrap items-center gap-2">
                    <AvatarGroup size="sm" max={4} total={invite.members.length} label={`Members of ${invite.workspace}`}>
                      {shown.map((m) => <Avatar key={m} name={m} />)}
                    </AvatarGroup>
                    <span>{formatNumber(invite.members.length, locale)} people</span>
                  </span>
                </DescriptionItem>
                <DescriptionItem term="Invite ends">{ends}</DescriptionItem>
              </DescriptionList>
              {other ? (
                <Alert tone="warning" title="You’re signed in with another account">
                  The invite went to {invite.email}, and you’re signed in as {signedInAs}. Joining adds {signedInAs}.
                </Alert>
              ) : null}
              <p className="m-0 text-sm text-text-muted">
                Joining as <strong className="wrap-anywhere">{signedInAs}</strong>. <Link href="#switch">Use another account</Link>
              </p>
              {failed ? <Alert tone="danger">Couldn’t join {invite.workspace}. Nothing has changed; try again.</Alert> : null}
              <div className="flex flex-wrap gap-2">
                <Button loading={busy} onClick={join}>Join {invite.workspace}</Button>
                <Button variant="secondary" disabled={busy} onClick={decline}>Decline</Button>
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
