// What Markdown becomes on the site: Serupa's own components. The .mdx pages get these for their elements, and the
// Markdown the docs' blocks render (a component's README.md, the changelog) goes through the same ones.
import * as React from 'react';
import MarkdownToJsx from 'markdown-to-jsx';
import { Heading } from '../../src/components/Heading/Heading';
import { Link } from '../../src/components/Link/Link';
import { CodeBlock } from '../../src/components/CodeBlock/CodeBlock';
import { Divider } from '../../src/components/Divider/Divider';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../src/components/Table/Table';
import { resolve } from './router';

type Props<T extends keyof React.JSX.IntrinsicElements> = React.ComponentProps<T>;
const cx = (...names: Array<string | undefined>) => names.filter(Boolean).join(' ');

// The text of a heading or a cell, for its id or its name.
const textOf = (node: React.ReactNode): string => (typeof node === 'string' || typeof node === 'number' ? String(node)
  : Array.isArray(node) ? node.map(textOf).join('')
  : React.isValidElement<{ children?: React.ReactNode }>(node) ? textOf(node.props.children) : '');

const heading = (level: 1 | 2 | 3 | 4 | 5 | 6) => function H({ children, id, className }: Props<'h2'>) {
  return <Heading level={level} id={id} className={cx(`site-h site-h${level}`, className)}>{children}</Heading>;
};

function A({ href = '', children, ...rest }: Props<'a'>) {
  const to = resolve(href);
  const outside = /^[a-z][a-z0-9+.-]*:/i.test(to) && !to.startsWith('mailto:');
  return <Link href={to} external={outside || undefined} {...rest}>{children}</Link>;
}

// Inline code, and the code inside a fenced block (which Pre below turns into a CodeBlock).
function Code({ className, children }: Props<'code'>) {
  return <code className={cx('site-code', className)}>{children}</code>;
}
function Pre({ children }: Props<'pre'>) {
  const code = React.Children.toArray(children).find((c) => React.isValidElement(c)) as React.ReactElement<Props<'code'>> | undefined;
  const language = /(?:lang|language)-([\w-]+)/.exec(code?.props.className ?? '')?.[1];
  return <CodeBlock className="site-pre" language={language} code={textOf(code?.props.children ?? children).replace(/\n$/, '')} />;
}

// Markdown's column alignment, which arrives as an align attribute (MDX) or a text-align style (markdown-to-jsx).
const alignOf = (p: { align?: string; style?: React.CSSProperties }) => {
  const a = p.align ?? p.style?.textAlign;
  return a === 'right' || a === 'end' ? 'end' as const : a === 'center' ? 'center' as const : undefined;
};
function Td(p: Props<'td'>) { return <TableCell align={alignOf(p)}>{p.children}</TableCell>; }
function Th(p: Props<'th'>) { return <TableHeaderCell align={alignOf(p)}>{p.children}</TableHeaderCell>; }

/** The elements of a docs page, as Serupa components. */
export const elements = {
  h1: heading(1), h2: heading(2), h3: heading(3), h4: heading(4), h5: heading(5), h6: heading(6),
  p: ({ children }: Props<'p'>) => <p className="site-p">{children}</p>,
  a: A,
  ul: ({ children }: Props<'ul'>) => <ul className="site-list">{children}</ul>,
  ol: ({ children, start }: Props<'ol'>) => <ol className="site-list" start={start}>{children}</ol>,
  blockquote: ({ children }: Props<'blockquote'>) => <blockquote className="site-quote">{children}</blockquote>,
  hr: () => <Divider className="site-hr" />,
  img: ({ src, alt = '' }: Props<'img'>) => <img className="site-img" src={src} alt={alt} />,
  code: Code,
  pre: Pre,
  table: ({ children }: Props<'table'>) => <Table size="sm" containerProps={{ className: 'site-table' }}>{children}</Table>,
  thead: ({ children }: Props<'thead'>) => <TableHead>{children}</TableHead>,
  tbody: ({ children }: Props<'tbody'>) => <TableBody>{children}</TableBody>,
  tr: ({ children }: Props<'tr'>) => <TableRow>{children}</TableRow>,
  th: Th,
  td: Td,
};

const overrides = Object.fromEntries(Object.entries(elements).map(([tag, component]) => [tag, { component }]));

// A component's name in prose, such as <Avatar> in a prop's description, is text, not a tag to draw: only the HTML
// the docs do use stays HTML, and a doc comment (plain) has none at all. Code spans and fences are left alone.
const HTML = new Set(['a', 'b', 'br', 'code', 'details', 'div', 'em', 'i', 'img', 'kbd', 'p', 'picture', 'pre', 'source', 'span', 'strong', 'sub', 'summary', 'sup']);
const CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/;
const proseTags = (text: string, none: boolean) => text.split(CODE).map((part, i) => (i % 2 ? part
  : part.replace(/<(?=\/?([A-Za-z][\w.-]*))/g, (lt, tag: string) => (!none && HTML.has(tag) ? lt : '&lt;')))).join('');

export interface MarkdownOptions { slugify?: (text: string, base: (text: string) => string) => string }
/** Markdown text as the site's elements. Takes the options the docs' blocks pass Storybook's Markdown block. */
export function Markdown({ children, options, plain = false }: { children: string; options?: MarkdownOptions; plain?: boolean }) {
  return <MarkdownToJsx options={{ ...options, overrides, wrapper: React.Fragment, forceBlock: true }}>{proseTags(children, plain)}</MarkdownToJsx>;
}
