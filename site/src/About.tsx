// The story page: why Serupa exists and how it is made (site/content/story.md, the one piece of the site written
// for it alone), then the principles and the decisions on record, both read from their sources.
import * as React from 'react';
import facts from 'virtual:site-facts';
import story from '../content/story.md?raw';
import { Button } from '../../src/components/Button/Button';
import { Heading } from '../../src/components/Heading/Heading';
import { PRINCIPLES } from './Home';
import { Markdown } from './markdown';
import { Shell } from './Shell';

export function About() {
  React.useEffect(() => { document.title = 'The story · Serupa'; window.scrollTo(0, 0); }, []);
  return <Shell>
    <article className="site-doc site-about">
      <header className="site-title">
        <p className="site-eyebrow">About</p>
        <Heading level={1} className="site-h1">The story behind Serupa</Heading>
        <p className="site-lead">A design system by Diki: one set of tokens, themes and accessible components that every project starts from.</p>
      </header>
      <Markdown>{story}</Markdown>

      <Heading level={2} id="principles" className="site-h site-h2">The principles</Heading>
      <p className="site-p">Eight principles guide how the components, the tokens and the docs are made. When two of them pull apart, accessibility comes first.</p>
      <ol className="site-principles site-principles--two" role="list">
        {PRINCIPLES.map((p, i) => <li key={p.name} className="site-principle">
          <span className="site-principle__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <Heading level={3} className="site-principle__name">{p.name}</Heading>
          <p className="site-principle__line">{p.line}</p>
        </li>)}
      </ol>
      <p className="site-more"><Button href="/foundations/design-principles" variant="outline" rightIcon="arrow_forward">Each principle, with examples</Button></p>

      <Heading level={2} id="decisions" className="site-h site-h2">Decisions on record</Heading>
      <p className="site-p">The choices that shape the system are written down with the options that were weighed, so a later change starts from the reasons and not from a guess. There are {facts.decisions.length} so far.</p>
      <ol className="site-decisions" role="list">
        {facts.decisions.map((d) => <li key={d.id} className="site-decision">
          <span className="site-decision__n" aria-hidden="true">{d.id.replace(/^0+/, '').padStart(2, '0')}</span>
          <Markdown plain>{d.title}</Markdown>
        </li>)}
      </ol>

      <Heading level={2} id="next" className="site-h site-h2">See it at work</Heading>
      <p className="site-p">The showcase puts the patterns on a phone, a tablet and a laptop, and the themes page shows one piece of product under all six themes.</p>
      <p className="site-more flex flex-wrap gap-3"><Button href="/showcase" rightIcon="arrow_forward">Open the showcase</Button><Button href="/themes" variant="outline">Compare the themes</Button></p>
    </article>
  </Shell>;
}
