'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';

export interface QuoteProps extends React.HTMLAttributes<HTMLElement> {
  /** The quoted words. A string becomes one paragraph; pass several <p> for more. */
  children?: React.ReactNode;
  /** Who said it: a person's name, or an organisation's. */
  author?: React.ReactNode;
  /** Where or in what role they said it: a job title and company, a book, a talk. */
  source?: React.ReactNode;
  /** A picture next to who said it, such as an <Avatar size="sm">. Leave it out when there's no author. */
  avatar?: React.ReactNode;
  /** The URL of the quote's source, for the <blockquote cite>. Not shown: link to it in source when people should follow it. */
  cite?: string | undefined;
  /** 'md' (default) in running content, or 'lg' for a pull quote or a testimonial that leads a section. */
  size?: 'md' | 'lg' | undefined;
}

/* Quote: quoted words in a <blockquote>, with who said them in a <figcaption>, both inside a <figure>, so the
   attribution stays outside the quote and is tied to it. A rule runs along the start edge, as in Prose.
   className, ref and every other prop go to the <figure>. */
const OWN = { children: 1, author: 1, source: 1, avatar: 1, cite: 1, size: 1, className: 1 } as const;

/** Quoted words with who said them: a testimonial, a pull quote or a quote outside Prose.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Quote = /* @__PURE__ */ component<HTMLElement, QuoteProps>('Quote', function Quote(props, ref) {
  const { children, author, source, avatar, cite, size, className } = props;
  const by = author != null && author !== false && author !== '';
  const from = source != null && source !== false && source !== '';
  return (
    <figure {...omit(props, OWN)} ref={ref} className={cn('dk-quote', size === 'lg' && 'dk-quote--lg', className)} data-component="quote">
      <blockquote className="dk-quote__text" cite={cite}>
        {typeof children === 'string' ? <p>{children}</p> : children}
      </blockquote>
      {by || from ? (
        <figcaption className="dk-quote__by">
          {avatar}
          <span className="dk-quote__who">
            {by ? <span className="dk-quote__author">{author}</span> : null}
            {from ? <span className="dk-quote__source">{source}</span> : null}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
});
