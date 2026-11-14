import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableOfContents } from './TableOfContents';

const sections = [
  { id: 'toc-intro', title: 'Introduction', level: 2 },
  { id: 'toc-install', title: 'Installation', level: 2 },
  { id: 'toc-npm', title: 'With npm', level: 3 },
  { id: 'toc-cdn', title: 'From a CDN', level: 3 },
  { id: 'toc-usage', title: 'Usage', level: 2 },
  { id: 'toc-theming', title: 'Theming', level: 2 },
  { id: 'toc-faq', title: 'Questions people ask', level: 2 },
];
const items = sections.map((s) => ({ id: s.id, label: s.title, level: s.level }));

const meta = {
  title: 'Components/Navigation/TableOfContents',
  component: TableOfContents,
  args: { items },
} satisfies Meta<typeof TableOfContents>;
export default meta;
type Story = StoryObj<typeof meta>;

const narrow = [(Story: React.ComponentType) => <div style={{ maxWidth: 240 }}><Story /></div>];

export const Playground: Story = { decorators: narrow };

/** Read from the headings of an article beside it, as a page's side column would. */
export const FromHeadings: Story = {
  name: 'From the page\'s headings',
  args: { items: undefined, container: '#toc-article' },
  // In the page's own column beside the text, wider than the default box; on a narrow page, above the text
  // (wrap-reverse flips the cross axis, so flex-end is the top).
  decorators: [(Story) => (
    <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'flex-end', gap: 32 }}>
      <div id="toc-article" style={{ flex: '1 1 240px', minWidth: 0 }}>
        {sections.map((s) => (
          <section key={s.id}>
            {React.createElement(s.level === 2 ? 'h2' : 'h3', { id: s.id }, s.title)}
            <p style={{ minHeight: 160 }}>Text of the {s.title.toLowerCase()} section.</p>
          </section>
        ))}
      </div>
      <div style={{ position: 'sticky', top: 16, flex: '0 1 200px' }}><Story /></div>
    </div>
  )],
};

export const NoTitle: Story = { name: 'Without a title', args: { title: null, 'aria-label': 'Sections' }, decorators: narrow };

// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: { items: [...items, { id: 'toc-long', label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a label long enough to wrap twice in a narrow column', level: 3 }] },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

/** The rail: a dash per section beside the text; point at it, Tab into it or tap it for the full list. */
export const Rail: Story = {
  args: { variant: 'rail' },
  decorators: [(Story) => <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 280, paddingInlineStart: 280 }}><Story /></div>],
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: two levels, which people can scan. */
export const DoTwoLevels: Story = { name: 'Do: keep to two levels', decorators: narrow };
/** Don't: four levels, which turn the list into a maze. */
export const DontDeepLevels: Story = {
  name: "Don't: go four levels deep",
  decorators: narrow,
  args: { items: [
    { id: 'toc-deep-a', label: 'Install', level: 2 },
    { id: 'toc-deep-b', label: 'With npm', level: 3 },
    { id: 'toc-deep-c', label: 'On Windows', level: 4 },
    { id: 'toc-deep-d', label: 'Behind a proxy', level: 5 },
    { id: 'toc-deep-e', label: 'Usage', level: 2 },
  ] },
};
