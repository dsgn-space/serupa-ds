import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from './ScrollArea';

const lines = (n: number) => Array.from({ length: n }, (_, i) => <p key={i} style={{ margin: '0 0 8px' }}>Activity {i + 1}: Dewi updated the delivery address for order {1040 + i}.</p>);
const tags = ['Design', 'Engineering', 'Finance', 'Legal', 'Marketing', 'Operations', 'People', 'Product', 'Research', 'Sales', 'Support'];

const meta = {
  title: 'Components/Layout and type/ScrollArea',
  component: ScrollArea,
  args: { 'aria-label': 'Recent activity', style: { maxHeight: 200, maxWidth: 360, padding: 12, border: '1px solid var(--border)', borderRadius: 8 }, children: lines(12) },
} satisfies Meta<typeof ScrollArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Vertical, the default: a list longer than its box. While it scrolls it's a Tab stop and a named region. */
export const Vertical: Story = {};

/** With fade: the edge with more past it fades out, so it reads as more to see. */
export const Faded: Story = { args: { fade: true } };

/** Horizontal: a row of chips that runs past its box. */
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal', fade: true, 'aria-label': 'Teams', style: { maxWidth: 320 },
    children: <div style={{ display: 'flex', gap: 8, width: 'max-content', paddingBlock: 4 }}>{tags.map((t) => <span key={t} style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 999 }}>{t}</span>)}</div>,
  },
};

/** Both ways: a wide table-like grid in a box with a height. */
export const Both: Story = {
  args: {
    orientation: 'both', 'aria-label': 'Schedule', style: { maxHeight: 160, maxWidth: 320 },
    children: <div style={{ width: 560 }}>{lines(10)}</div>,
  },
};

/** Content that fits: no scrollbar, no Tab stop, no region. */
export const Fits: Story = { args: { children: lines(2) } };

// The stress story (G14): long words in a narrow box.
export const LongText: Story = {
  args: { style: { maxHeight: 120, maxWidth: 200 }, children: <p style={{ margin: 0, overflowWrap: 'anywhere' }}>Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a sentence long enough to wrap many times in a narrow column, so the box scrolls down.</p> },
};
