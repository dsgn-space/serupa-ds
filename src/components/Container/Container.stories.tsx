import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';

const meta = {
  title: 'Components/Layout and type/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: { children: <div className="rounded-md bg-surface-muted p-4 text-sm text-text">The content stays this wide and centered, with padding at the sides.</div> },
  argTypes: { size: { control: 'select', options: ['prose', 'md', 'lg', 'xl', '2xl', 'full'] }, children: { control: false } },
} satisfies Meta<typeof Container>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 py-4">
      {(['prose', 'md', 'lg', 'xl', '2xl'] as const).map((s) => <Container key={s} size={s}><div className="rounded-md bg-surface-muted p-3 text-sm text-text">size="{s}"</div></Container>)}
    </div>
  ),
};

export const Prose: Story = {
  args: { size: 'prose', children: <p className="text-base text-text">Long text reads best at around 65 to 75 characters a line. The prose size keeps an article to that width on a wide screen, and the side padding keeps it off the edges on a phone.</p> },
};

export const FullWidth: Story = {
  name: 'Full width',
  args: { size: 'full', children: <div className="rounded-md bg-surface-muted p-4 text-sm text-text">size="full" spans the page, keeping only the side padding.</div> },
};

export const NotPadded: Story = {
  name: 'No side padding',
  args: { size: 'md', padded: false, children: <div className="rounded-md bg-surface-muted p-4 text-sm text-text">padded={'{false}'}: no padding at the sides, for content that brings its own.</div> },
};

export const LongText: Story = {
  args: { size: 'prose', children: <div className="rounded-md bg-surface-muted p-4 text-sm text-text wrap-anywhere">A long paragraph keeps to the container's width and wraps, and with the wrap-anywhere utility an unbroken word like DonaudampfschifffahrtsgesellschaftskapitänskajüteDonaudampfschifffahrtsgesellschaftskapitänskajüte breaks rather than pushing the page sideways.</div> },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
const band = (text: string) => <div className="rounded-md bg-surface-muted p-3 text-sm text-text">{text}</div>;
/** Do: the same `size` for the header, main content and footer, so their edges line up. */
export const DoSameSize: Story = {
  name: 'Do: one size for the page',
  render: () => <div style={{ display: 'grid', gap: 8 }}>{['Header', 'Main content', 'Footer'].map((t) => <Container key={t} size="md">{band(t)}</Container>)}</div>,
};
/** Don't: a different size for each part, so the edges step in and out down the page. */
export const DontMixedSizes: Story = {
  name: "Don't: mix sizes on one page",
  render: () => <div style={{ display: 'grid', gap: 8 }}>{([['Header', 'xl'], ['Main content', 'md'], ['Footer', 'lg']] as const).map(([t, s]) => <Container key={t} size={s}>{band(t)}</Container>)}</div>,
};
