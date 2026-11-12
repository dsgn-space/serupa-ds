'use client';
import * as React from 'react';
import { Accordion, AccordionItem } from '../../components/Accordion/Accordion';
import { Field } from '../../components/Field/Field';
import { Heading } from '../../components/Heading/Heading';
import { Highlight, highlightRanges } from '../../components/Highlight/Highlight';
import { SearchInput } from '../../components/SearchInput/SearchInput';

/* FAQ (RU17): questions and answers in groups, for an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the FAQ is a region named by its heading; each group has its own heading, and each question is a heading
     holding a button (Accordion), so a screen reader can list and jump between them.
   - Find-in-page reaches closed answers: they are hidden="until-found", and a match opens its question (Accordion).
   - 4.1.3: the search field filters the questions, and how many match is said politely (role="status").
     The words that matched are marked in each question (Highlight), so they show without color alone (1.4.1).
   - 2.4.3: a link to a question (#its-id, from a help article or a support reply) opens it and moves focus to it.
   - 3.3.5: "Still stuck?" is always there, after the questions and in the no-match text, so help is never a dead end.
   - Each word is a prop or a label, English by default. */

export interface FaqQuestion {
  /** Its id in the page: a link to #id opens it. Letters, digits and dashes: "cancel-plan". */
  id: string;
  /** The question, as people ask it: "How do I cancel my plan?". */
  question: string;
  /** The answer: text, or your own markup (paragraphs, a list, links). */
  answer: React.ReactNode;
  /** More words the search finds this question by, when the answer isn't plain text or people use other words:
      "refund money back". */
  keywords?: string | undefined;
}

export interface FaqGroup {
  id: string;
  /** The group's heading: "Billing". Leave it out when there's one group. */
  title?: string | undefined;
  questions: readonly FaqQuestion[];
}

/** The words Faq says. Pass your own for a page in another language. */
export interface FaqLabels {
  /** The FAQ's heading. */
  title: string;
  /** The search field's label. */
  search: string;
  /** How many questions match, said and shown while searching: "3 of 12 questions". */
  results: (shown: number, total: number) => string;
  /** Shown when nothing matches. */
  noMatch: (query: string) => string;
  /** The heading over the contact part. */
  stuck: string;
}
const EN: FaqLabels = {
  title: 'Frequently asked questions',
  search: 'Search the questions',
  results: (shown, total) => `${shown} of ${total} ${total === 1 ? 'question' : 'questions'}`,
  noMatch: (query) => `No questions match “${query}”. Try other words, or ask us.`,
  stuck: 'Still stuck?',
};

export interface FaqProps {
  groups: readonly FaqGroup[];
  /** The FAQ's heading level, to fit the page. Groups and questions take the next levels. Default: 2. */
  headingLevel?: 2 | 3 | undefined;
  /** Shows the search field. Default: true when there are more than 6 questions. */
  searchable?: boolean | undefined;
  /** How to reach a person, under "Still stuck?": a sentence and a Button or Link. Leave it out only when the
      page already says how, next to the FAQ. */
  contact?: React.ReactNode;
  /** The questions open at first, by id. A link to #id opens one too. Default: none. */
  defaultOpen?: readonly string[] | undefined;
  /** The search at first: from the page's address (?q=), or a help search people came from. Default: ''. */
  defaultQuery?: string | undefined;
  /** Its words, in the page's language. Each one left out stays English. */
  labels?: Partial<FaqLabels> | undefined;
}

const text = (q: FaqQuestion) => [q.question, typeof q.answer === 'string' ? q.answer : '', q.keywords || ''].join(' ');
const terms = (query: string) => query.split(/\s+/).filter(Boolean);
// Every word of the search is somewhere in the question, its answer or its keywords; case and accents don't count.
const matches = (q: FaqQuestion, query: string) => terms(query).every((t) => highlightRanges(text(q), t).length > 0);

/** Questions and answers in groups: find-in-page reaches closed answers, a search filters them, a link opens one,
    and "Still stuck?" is always there. */
export function Faq({ groups, headingLevel = 2, searchable, contact, defaultOpen, defaultQuery = '', labels }: FaqProps) {
  const w = { ...EN, ...labels };
  const id = React.useId();
  const all = groups.flatMap((g) => g.questions);
  const [open, setOpen] = React.useState<string[]>(() => (defaultOpen ? defaultOpen.slice() : []));
  const [query, setQuery] = React.useState(defaultQuery);
  const q = query.trim();
  const shown = groups.map((g) => ({ ...g, questions: g.questions.filter((x) => matches(x, q)) })).filter((g) => g.questions.length);
  const count = shown.reduce((n, g) => n + g.questions.length, 0);
  // A link to #question-id opens that question and moves focus to its button, on load and on a later hash change.
  const root = React.useRef<HTMLElement>(null);
  const ids = all.map((x) => x.id).join(' ');
  React.useEffect(() => {
    const go = () => {
      const target = decodeURIComponent(window.location.hash.slice(1));
      if (!target || ids.split(' ').indexOf(target) < 0) return;
      setQuery('');
      setOpen((o) => (o.indexOf(target) >= 0 ? o : o.concat(target)));
      requestAnimationFrame(() => {
        const button = root.current?.querySelector<HTMLButtonElement>(`[id="${CSS.escape(target)}"] button[aria-expanded]`);
        if (button) { button.focus({ preventScroll: true }); button.scrollIntoView({ block: 'start' }); }
      });
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, [ids]);
  const level = headingLevel + 1 as 3 | 4;
  const titled = groups.some((g) => g.title);
  const stuck = contact ? (
    <section aria-labelledby={id + '-stuck'} className="flex flex-col gap-2 border-t border-border pt-6">
      <Heading level={level} size="base" id={id + '-stuck'}>{w.stuck}</Heading>
      <div className="flex flex-col items-start gap-3 text-sm text-text-muted">{contact}</div>
    </section>
  ) : null;
  return (
    <section ref={root} aria-labelledby={id} className="flex flex-col gap-6">
      <Heading level={headingLevel} id={id}>{w.title}</Heading>
      {(searchable ?? all.length > 6) ? (
        <div className="flex flex-col gap-2">
          <Field label={w.search}>
            <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          <p role="status" className="m-0 text-sm text-text-muted">{q ? w.results(count, all.length) : ''}</p>
        </div>
      ) : null}
      {count === 0 ? <p className="m-0">{w.noMatch(q)}</p> : shown.map((g) => (
        <div key={g.id} className="flex flex-col gap-2">
          {g.title ? <Heading level={level} size="lg" id={`${id}-${g.id}`}>{g.title}</Heading> : null}
          <Accordion type="multiple" value={open} onValueChange={setOpen} headingLevel={titled ? (level + 1) as 4 | 5 : level}>
            {g.questions.map((x) => (
              <AccordionItem key={x.id} id={x.id} value={x.id} title={<Highlight query={terms(q)} words>{x.question}</Highlight>}>
                {typeof x.answer === 'string' ? <p className="m-0">{x.answer}</p> : x.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
      {stuck}
    </section>
  );
}
