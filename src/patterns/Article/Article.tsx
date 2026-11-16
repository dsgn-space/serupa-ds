'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Navbar, NavbarLink } from '../../components/Navbar/Navbar';
import { Breadcrumb, BreadcrumbItem } from '../../components/Breadcrumb/Breadcrumb';
import { Heading } from '../../components/Heading/Heading';
import { Avatar } from '../../components/Avatar/Avatar';
import { Prose } from '../../components/Prose/Prose';
import { TableOfContents } from '../../components/TableOfContents/TableOfContents';
import { Card, CardHeader } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Footer, type FooterLinkGroup } from '../../blocks/Footer/Footer';
import { useLocale } from '../../internal/provider';

/* Article: one post of a blog, a changelog or a help article, for an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: an <article> with one h1, its sections as h2s, and the byline's date in a <time> with the machine date,
     so it's read as a date and found by search engines.
   - 2.4.5, 2.4.8: the breadcrumb says where the page sits, and "On this page" lists its sections, so there's more
     than one way to a part of it, and the reader knows where they are (the current section is marked).
   - 2.4.4: each "Read next" card is a link named by the post's title, with its summary under it.
   - 1.4.8, 1.4.12: the text keeps to a readable line length (Prose), and spacing set by the reader isn't cut off.
   - 3.1.1, 3.1.2: the date is written in the page's language (Intl), and a post in another language says so with lang.
   The posts themselves (fetching, rendering Markdown) are the app's job: pass them as sections. */

export interface ArticleSection {
  /** The h2's id: a link to #id goes to it. */
  id: string;
  title: string;
  body: React.ReactNode;
}
export interface ArticleSummary { id: string; title: string; summary: string; href: string }

export interface ArticleProps {
  title?: string | undefined;
  /** The line under the title: what the reader gets from it. */
  summary?: string | undefined;
  author?: { name: string; role?: string | undefined; avatar?: string | undefined } | undefined;
  /** When it was published, as an ISO date: "2026-11-12". */
  published?: string | undefined;
  /** How long it takes to read, in minutes. */
  minutes?: number | undefined;
  /** The post's language, when it isn't the page's: "id". */
  lang?: string | undefined;
  sections?: readonly ArticleSection[] | undefined;
  /** Other posts to read next. With none, the section isn't there. */
  related?: readonly ArticleSummary[] | undefined;
  footer?: readonly FooterLinkGroup[] | undefined;
}

const demoSections: ArticleSection[] = [
  { id: 'why', title: 'Why we changed it', body: <>
    <p>Most teams told us the same thing: they open a project to see what’s next, and the board shows them everything at once. The work that matters today sits beside work for next quarter.</p>
    <p>So a project now opens on <strong>This week</strong>: the tasks due in the next seven days, and the ones waiting on you first.</p>
  </> },
  { id: 'what-changes', title: 'What changes for you', body: <>
    <ul>
      <li>A project opens on This week. The whole board is one tab away, where it was.</li>
      <li>Tasks waiting on you are marked, in words and with a dot.</li>
      <li>Nothing moves or is deleted: your columns, filters and saved views stay as they are.</li>
    </ul>
  </> },
  { id: 'turn-off', title: 'If you’d rather keep the board', body: <>
    <p>Go to <strong>Settings, Projects</strong> and set <strong>Open projects on</strong> to <strong>Board</strong>. It’s per person, so your team can choose for themselves.</p>
  </> },
];
const demoRelated: ArticleSummary[] = [
  { id: 'views', title: 'Saved views, shared with a link', summary: 'Save a filter once and send it to your team.', href: '#saved-views' },
  { id: 'offline', title: 'Working offline, and what syncs when', summary: 'What you can do on a plane, and how changes come back together.', href: '#offline' },
];
const demoFooter: FooterLinkGroup[] = [
  { title: 'Blog', links: [{ label: 'All posts', href: '#blog' }, { label: 'Product updates', href: '#updates' }, { label: 'RSS feed', href: '#rss' }] },
  { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }] },
];

/** A post: breadcrumb, title and byline, "On this page", the sections, then what to read next and the footer. */
export function Article({ title = 'Projects now open on what’s due this week', summary = 'A project shows you what to do next, not everything at once. Here’s what changed, and how to keep the old view.',
  author = { name: 'Ana Putri', role: 'Product designer' }, published = '2026-11-12', minutes = 3, lang, sections = demoSections, related = demoRelated,
  footer = demoFooter }: ArticleProps) {
  const locale = useLocale();
  // The date in the page's language, and in UTC so a date-only ISO string is the same day everywhere.
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${published}T00:00:00Z`));
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <Navbar brand={<a href="#home" className="text-base font-semibold text-text no-underline">Acme</a>}>
        <NavbarLink href="#product">Product</NavbarLink>
        <NavbarLink href="#blog" active>Blog</NavbarLink>
      </Navbar>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 outline-none">
        <Breadcrumb>
          <BreadcrumbItem href="#blog">Blog</BreadcrumbItem>
          <BreadcrumbItem current as="span">{title}</BreadcrumbItem>
        </Breadcrumb>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <article lang={lang} aria-labelledby="article-title" className="flex min-w-0 flex-col gap-8 lg:col-span-3">
            <header className="flex flex-col gap-4">
              <Heading level={1} size="3xl" id="article-title" className="text-balance">{title}</Heading>
              {summary ? <p className="m-0 text-lg text-text-muted">{summary}</p> : null}
              <div className="flex items-center gap-3">
                <Avatar name={author.name} src={author.avatar} />
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{author.name}{author.role ? <span className="font-normal text-text-muted">, {author.role}</span> : null}</span>
                  <span className="text-text-muted"><time dateTime={published}>{date}</time>{minutes ? ` · ${minutes} min read` : null}</span>
                </div>
              </div>
            </header>
            <Prose>
              {sections.map((s) => (
                <React.Fragment key={s.id}>
                  <h2 id={s.id}>{s.title}</h2>
                  {s.body}
                </React.Fragment>
              ))}
            </Prose>
          </article>
          <div data-print="hide" className="order-first lg:order-none">
            <div className="top-8 lg:sticky">
              <TableOfContents items={sections.map((s) => ({ id: s.id, label: s.title }))} />
            </div>
          </div>
        </div>
        {related.length ? (
          <section aria-labelledby="article-next" data-print="hide" className="flex flex-col gap-4 border-t border-border pt-8">
            <Heading level={2} size="lg" id="article-next">Read next</Heading>
            <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id} className="flex">
                  <Card href={r.href} className="w-full">
                    <CardHeader title={r.title} description={r.summary} headingLevel={3} />
                  </Card>
                </li>
              ))}
            </ul>
            <p className="m-0"><Link href="#blog">All posts</Link></p>
          </section>
        ) : null}
      </main>
      <Footer groups={footer} legal={<p className="m-0">© 2026 Acme, Inc. <Link href="#terms">Terms</Link> · <Link href="#privacy">Privacy</Link></p>} />
    </div>
  );
}
