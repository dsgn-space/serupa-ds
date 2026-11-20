'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Link } from '../../components/Link/Link';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Loader } from '../../components/Loader/Loader';
import { Card } from '../../components/Card/Card';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Leaderboard: who's ahead this week, this month or of all time, where you are, and who's moving. For an app to copy.
   What it carries (WCAG 2.2):
   - 1.3.1: the board is a table with a caption; each row's name is its row header, so every cell is read with it.
   - 1.3.1: a tie shares its place, said as "Joint 3rd", not left to the numbers to show.
   - 1.4.1: your row says "You" in a badge, as well as being shaded; a move up or down is said in words ("Up 2"),
     never only an arrow or a color.
   - 4.1.3: switching the period says which period the board shows.
   - 1.3.2: when you're outside the top places, your row follows them after a row that says how many are between.
   Scoring is the app's job: pass the people and their points for each period. */

export type Period = 'week' | 'month' | 'all';
export interface Player { id: string; name: string; points: Record<Period, number>; moved?: Partial<Record<Period, number>> | undefined }

export interface LeaderboardProps {
  players?: Player[] | undefined;
  /** Your id. */
  me?: string | undefined;
  /** How many places show before yours. Default: 5. */
  top?: number | undefined;
  /** Still loading: a placeholder shows instead of the board. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load the leaderboard" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const P = (id: string, name: string, week: number, month: number, all: number, moved: Partial<Record<Period, number>> = {}): Player => ({ id, name, points: { week, month, all }, moved });
const demo: Player[] = [
  P('dewi', 'Dewi Lestari', 420, 1630, 18210, { week: 1, month: 0 }),
  P('chen', 'Chen Wei', 410, 1720, 20480, { week: -1, month: 2 }),
  P('sara', 'Sara Haddad', 380, 1490, 15020, { week: 3 }),
  P('kofi', 'Kofi Mensah', 380, 1210, 9900, { week: 0, month: -1 }),
  P('lena', 'Lena Vogel', 300, 1490, 12040, { week: -2 }),
  P('tomas', 'Tomás Ruiz', 260, 980, 8800),
  P('eko', 'Eko Prasetyo', 240, 900, 7700, { week: 1 }),
  P('maya', 'Maya Chen', 200, 870, 6100),
  P('ana', 'Ana Lima', 150, 640, 4300, { week: -1, month: 1 }),
];
const PERIODS: { value: Period; label: string; long: string }[] = [
  { value: 'week', label: 'This week', long: 'this week' },
  { value: 'month', label: 'This month', long: 'this month' },
  { value: 'all', label: 'All time', long: 'of all time' },
];

/** Players by points for a period, highest first, with their place; equal points share a place. */
export function rank(players: Player[], period: Period) {
  const sorted = [...players].sort((a, b) => b.points[period] - a.points[period] || a.name.localeCompare(b.name));
  return sorted.map((p, i) => {
    const place = sorted.findIndex((q) => q.points[period] === p.points[period]) + 1;
    const joint = sorted.filter((q) => q.points[period] === p.points[period]).length > 1;
    return { ...p, place, joint, index: i };
  });
}

/** "1st", "2nd", "3rd", "11th", "22nd". */
export function ordinal(n: number) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${s}`;
}

/** The leaderboard page: a skip link, a header, then main with the h1, the period, and the board. */
export function Leaderboard({ players = demo, me = 'ana', top = 5, loading = false, loadFailed = false, onRetry }: LeaderboardProps) {
  const locale = useLocale();
  const num = (n: number) => formatNumber(n, locale);
  const [period, setPeriod] = React.useState<Period>('week');
  const ranked = rank(players, period);
  const mine = ranked.find((r) => r.id === me);
  const shown = ranked.slice(0, top);
  const apart = mine && mine.index >= top ? mine : null;
  const between = apart ? apart.index - top : 0;
  const long = PERIODS.find((p) => p.value === period)!.long;
  const placeWords = (r: (typeof ranked)[number]) => `${r.joint ? 'Joint ' : ''}${ordinal(r.place)}`;
  const movedWords = (m: number | undefined) => (!m ? 'No change' : m > 0 ? `Up ${num(m)}` : `Down ${num(-m)}`);

  const row = (r: (typeof ranked)[number]) => (
    <TableRow key={r.id} selected={r.id === me}>
      <TableCell>{placeWords(r)}</TableCell>
      <TableHeaderCell scope="row" className="font-normal">
        <span className="flex items-center gap-2">
          <Avatar name={r.name} alt="" size="sm" />
          <span className="min-w-0 wrap-break-word">{r.name}</span>
          {r.id === me ? <Badge tone="primary">You</Badge> : null}
        </span>
      </TableHeaderCell>
      <TableCell align="end">{num(r.points[period])}</TableCell>
      <TableCell className="text-text-muted">{period === 'all' ? '' : movedWords(r.moved?.[period])}</TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Steps</p>
        <Link underline="hover" href="#challenges">Challenges</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Challenges', href: '#challenges' }, { label: 'Leaderboard' }]} title="Leaderboard"
          description={loading || loadFailed ? undefined : mine ? `You’re ${placeWords(mine).toLowerCase()} of ${num(players.length)} ${long}, with ${num(mine.points[period])} points.` : `${num(players.length)} people taking part.`} />
        {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the leaderboard" onRetry={() => onRetry?.()} headingLevel={2} /></div>
          : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading the leaderboard" /></Card> : (<>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <SegmentedControl aria-label="Period" value={period} onValueChange={setPeriod} options={PERIODS.map(({ value, label }) => ({ value, label }))} />
          <p role="status" id="board-period" className="m-0 text-sm text-text-muted">Showing points {long}</p>
        </div>
        <div className="pt-4">
          <Table caption={`Leaderboard, points ${long}`} hideCaption>
            <TableHead><TableRow>
              <TableHeaderCell>Place</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell align="end">Points</TableHeaderCell>
              <TableHeaderCell>{period === 'all' ? <span className="sr-only">Change</span> : 'Change'}</TableHeaderCell>
            </TableRow></TableHead>
            <TableBody>
              {shown.map(row)}
              {apart ? (
                <>
                  {between ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-text-muted">{between === 1 ? '1 more person' : `${num(between)} more people`} between</TableCell>
                    </TableRow>
                  ) : null}
                  {row(apart)}
                </>
              ) : null}
            </TableBody>
          </Table>
        </div>
        </>)}
      </main>
    </div>
  );
}
