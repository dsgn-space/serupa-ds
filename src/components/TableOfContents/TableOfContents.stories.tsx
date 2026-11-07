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
  // In the page's own column, wider than the default box.
  decorators: [(Story) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 32 }}>
      <div id="toc-article">
        {sections.map((s) => (
          <section key={s.id}>
            {React.createElement(s.level === 2 ? 'h2' : 'h3', { id: s.id }, s.title)}
            <p style={{ minHeight: 160 }}>Text of the {s.title.toLowerCase()} section.</p>
          </section>
        ))}
      </div>
      <div style={{ position: 'sticky', top: 16, alignSelf: 'start' }}><Story /></div>
    </div>
  )],
};

export const NoTitle: Story = { name: 'Without a title', args: { title: null, 'aria-label': 'Sections' }, decorators: narrow };

// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: { items: [...items, { id: 'toc-long', label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a label long enough to wrap twice in a narrow column', level: 3 }] },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};
