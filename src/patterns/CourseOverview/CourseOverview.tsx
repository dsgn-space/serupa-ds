'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Accordion, AccordionItem } from '../../components/Accordion/Accordion';
import { Avatar } from '../../components/Avatar/Avatar';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Link } from '../../components/Link/Link';
import { Progress } from '../../components/Progress/Progress';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Loader } from '../../components/Loader/Loader';
import { Duration } from '../../components/Duration/Duration';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Course overview: a course's modules and lessons, how far you are, where to carry on, and marking lessons done.
   For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: each module is a heading that opens its lessons, and says how many are done; the lessons are an
     ordered list, each a link with how long it takes.
   - 1.3.1, 4.1.3: progress is a progress bar named "Course progress", its value in words ("4 of 12 lessons"),
     and a change to it is said.
   - 2.4.4: Continue names the lesson it opens; once every lesson is done, it's the certificate instead.
   - 4.1.2: each lesson's Done box is named by the lesson ("Done: Kerning").
   - 2.4.3: the module with the next lesson starts open, so its lessons are where Tab goes.
   Saving progress is the app's job: onDoneChange gets the lesson and whether it's done. */

export interface Lesson { id: string; title: string; minutes: number }
export interface CourseModule { id: string; title: string; lessons: Lesson[] }

export interface CourseOverviewProps {
  title?: string | undefined;
  description?: string | undefined;
  teacher?: string | undefined;
  modules?: CourseModule[] | undefined;
  /** The ids of the lessons done so far. */
  defaultDone?: string[] | undefined;
  /** Saves a lesson as done or not. */
  onDoneChange?: ((lessonId: string, done: boolean) => void) | undefined;
  /** The lessons are still loading: a placeholder in their place. Default: false. */
  loading?: boolean | undefined;
  /** The lessons failed to load: a "Couldn’t load the course" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads them again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demoModules: CourseModule[] = [
  { id: 'm1', title: 'Seeing type', lessons: [
    { id: 'l1', title: 'Welcome, and what you need', minutes: 4 },
    { id: 'l2', title: 'Anatomy of a letter', minutes: 12 },
    { id: 'l3', title: 'Serif, sans and the rest', minutes: 15 },
  ] },
  { id: 'm2', title: 'Setting text', lessons: [
    { id: 'l4', title: 'Size and line length', minutes: 18 },
    { id: 'l5', title: 'Leading', minutes: 10 },
    { id: 'l6', title: 'Kerning and tracking', minutes: 14 },
    { id: 'l7', title: 'Practice: a page of a book', minutes: 45 },
  ] },
  { id: 'm3', title: 'Pairing and hierarchy', lessons: [
    { id: 'l8', title: 'Pairing two typefaces', minutes: 16 },
    { id: 'l9', title: 'Headings that lead', minutes: 13 },
    { id: 'l10', title: 'Final project: a poster', minutes: 90 },
  ] },
];

/** How many lessons are done of how many, and the first one not done (null when every one is). */
export function courseProgress(modules: CourseModule[], done: string[]) {
  const all = modules.flatMap((m) => m.lessons);
  const next = all.find((l) => !done.includes(l.id)) ?? null;
  return { done: all.filter((l) => done.includes(l.id)).length, total: all.length, next, nextModule: modules.find((m) => m.lessons.includes(next!))?.id ?? null };
}

/** The course page: a skip link, a header, then main with the h1, progress, Continue, and the modules. */
export function CourseOverview({ title = 'Typography for the screen', description = 'Choose, set and pair type so that it reads well on any screen.',
  teacher = 'Lena Vogel', modules = demoModules, defaultDone = ['l1', 'l2', 'l3', 'l4'], onDoneChange, loading = false, loadFailed = false, onRetry }: CourseOverviewProps) {
  const locale = useLocale();
  const num = (n: number) => formatNumber(n, locale);
  const [done, setDone] = React.useState(defaultDone);
  const p = courseProgress(modules, done);
  const [open, setOpen] = React.useState<string[]>(p.nextModule ? [p.nextModule] : []);
  const total = <Duration value={modules.flatMap((m) => m.lessons).reduce((a, l) => a + l.minutes, 0)} unit="minute" />;
  const lessonsWords = (d: number, t: number) => `${num(d)} of ${num(t)} lessons`;

  const mark = (id: string, on: boolean) => {
    const next = on ? [...done, id] : done.filter((d) => d !== id);
    setDone(next);
    onDoneChange?.(id, on);
    const after = courseProgress(modules, next);
    announce(after.next ? `${lessonsWords(after.done, after.total)} done.` : 'Every lesson done. Your certificate is ready.');
  };

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
        <Link underline="hover" href="#courses">Your courses</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Your courses', href: '#courses' }, { label: title }]} title={title} description={description} />
        {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load the course" onRetry={() => onRetry?.()} headingLevel={2} /></div>
          : loading ? <Card className="mt-6"><Loader variant="skeleton" shape="text" lines={6} label="Loading the course" /></Card> : (<>
        <div className="flex flex-col gap-6 pt-6">
          <p className="m-0 flex flex-wrap items-center gap-2 text-text-muted">
            <Avatar name={teacher} alt="" size="sm" />
            <span>With {teacher} · {num(p.total)} lessons · {total} in all</span>
          </p>
          <Card className="flex flex-col gap-4">
            <Progress label="Course progress" value={p.done} max={p.total} showValue tone={p.next ? 'primary' : 'success'}
              formatValue={(v, m) => lessonsWords(v, m)} />
            {p.next ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="m-0"><span className="block text-sm text-text-muted">Up next</span><span className="font-semibold">{p.next.title}</span></p>
                <Button href={`#lesson-${p.next.id}`} aria-label={`Continue: ${p.next.title}`}>Continue</Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="m-0 font-semibold">You’ve done every lesson. Well done!</p>
                <Button href="#certificate">Get your certificate</Button>
              </div>
            )}
          </Card>
          <Accordion selectionMode="multiple" value={open} onValueChange={setOpen} headingLevel={2} variant="card">
            {modules.map((m, mi) => {
              const d = m.lessons.filter((l) => done.includes(l.id)).length;
              return (
                <AccordionItem key={m.id} value={m.id} title={<span className="flex flex-wrap items-baseline gap-x-3">
                  <span>{num(mi + 1)}. {m.title}</span>
                  <span className="text-sm font-normal text-text-muted">{d === m.lessons.length ? 'Done' : lessonsWords(d, m.lessons.length)}</span>
                </span>}>
                  <ol className="m-0 flex list-none flex-col gap-3 pt-2">
                    {m.lessons.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-center justify-between gap-3">
                        <span className="min-w-0">
                          <Link href={`#lesson-${l.id}`}>{l.title}</Link>
                          <span className="block text-sm text-text-muted"><Duration value={l.minutes} unit="minute" />{l.id === p.next?.id ? ' · Up next' : ''}</span>
                        </span>
                        <Checkbox aria-label={`Done: ${l.title}`} checked={done.includes(l.id)} onCheckedChange={(on) => mark(l.id, on)}>Done</Checkbox>
                      </li>
                    ))}
                  </ol>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
        </>)}
      </main>
    </div>
  );
}
