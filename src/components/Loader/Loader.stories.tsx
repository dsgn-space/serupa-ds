import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader } from './Loader';

const meta = {
  title: 'Components/Feedback/Loader',
  component: Loader,
  args: { variant: 'ring', size: 'md', tone: 'neutral', delay: 0 },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ring', 'spokes', 'dots', 'pixel', 'text', 'skeleton'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['neutral', 'primary', 'muted', 'inverse'] },
    pattern: { control: 'select', options: ['wave', 'random', 'sweep', 'fall', 'rise', 'snake', 'spiral', 'cross', 'checker'] },
    shape: { control: 'inline-radio', options: ['text', 'circle', 'rect'] },
  },
} satisfies Meta<typeof Loader>;
export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-6">{children}</div>;

export const Playground: Story = {};

export const VariantsAndSizes: Story = {
  name: 'Variants and sizes',
  render: () => <div className="flex flex-col gap-4">
    {(['ring', 'spokes', 'dots', 'pixel'] as const).map((v) => <Row key={v}>{(['sm', 'md', 'lg'] as const).map((s) => <Loader key={s} variant={v} size={s} delay={0} />)}</Row>)}
  </div>,
};

export const Tones: Story = {
  render: () => <Row>
    <Loader delay={0} />
    <Loader tone="primary" delay={0} />
    <Loader tone="muted" delay={0} />
    <span className="p-3 rounded-md" style={{ background: 'var(--surface-inverse)' }}><Loader tone="inverse" delay={0} /></span>
  </Row>,
};

export const PixelPatterns: Story = {
  name: 'Pixel patterns',
  render: () => <Row>{(['wave', 'random', 'sweep', 'fall', 'rise', 'snake', 'spiral', 'cross', 'checker'] as const).map((p) => <Loader key={p} variant="pixel" pattern={p} size="lg" delay={0} />)}</Row>,
};

// KW22: which spinner speed feels quickest? The ring at the old motion-loop-spinner (1s a turn) beside 800ms and
// 700ms, set on a wrapper so only these three change. A faster turn can make a wait feel shorter; too fast reads as
// alarm. 700ms was picked (the token now, KW22): the quickest of the three that still reads as steady. Reduced motion
// keeps its breathe at any speed.
export const SpinnerSpeeds: Story = {
  name: 'Spinner speeds',
  render: () => <Row>
    {([1000, 800, 700] as const).map((ms) => <div key={ms} className="flex flex-col items-center gap-2 text-sm text-text-muted" style={{ '--motion-loop-spinner': `${ms}ms` } as React.CSSProperties}>
      <Loader size="lg" delay={0} label={`Loading, one turn every ${ms}ms`} />
      <span aria-hidden="true">{ms === 1000 ? '1000ms (today)' : `${ms}ms`}</span>
    </div>)}
  </Row>,
};

export const Text: Story = { args: { variant: 'text', label: 'Generating summary' } };

export const Skeleton: Story = {
  render: () => <div className="flex items-start gap-4" style={{ maxWidth: 420 }}>
    <Loader variant="skeleton" shape="circle" size="lg" delay={0} />
    <div className="flex flex-col gap-3 grow">
      <Loader variant="skeleton" lines={3} delay={0} label="Loading profile" />
      <Loader variant="skeleton" shape="rect" delay={0} label="" />
    </div>
  </div>,
};

export const LongLabel: Story = {
  args: { variant: 'text', label: 'Loading every report for the last twelve months' },
  render: (args) => <div style={{ width: 160 }}><Loader {...args} /></div>,
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
const ROWS = ['Atlas', 'Northwind', 'Lumen'];
/** Do: one ring for the area that's loading. */
export const DoOnePerArea: Story = {
  name: 'Do: one per area',
  render: () => <div style={{ display: 'grid', placeItems: 'center', maxWidth: 320, height: 132, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}><Loader label="Loading projects" /></div>,
};
/** Don't: a ring on every row, which spins in many places at once. */
export const DontOnePerRow: Story = {
  name: "Don't: one per row",
  render: () => <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 320, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
    {ROWS.map((r) => <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-3)' }}>{r}<Loader size="sm" label={`Loading ${r}`} /></div>)}
  </div>,
};
