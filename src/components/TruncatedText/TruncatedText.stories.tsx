import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TruncatedText } from './TruncatedText';
import { Link } from '../Link/Link';

const box = (width: number, children: React.ReactNode) => <div style={{ width, maxWidth: '100%' }}>{children}</div>;

const meta = {
  title: 'Components/Layout and type/TruncatedText',
  component: TruncatedText,
  args: { children: 'quarterly-report-final-version-2-reviewed-by-finance.pdf' },
  decorators: [(Story) => box(240, <Story />)],
} satisfies Meta<typeof TruncatedText>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Cut: point at it, Tab to it or tap it for the whole name. */
export const Playground: Story = {};

/** Text that fits is plain text: no tab stop, nothing on hover. */
export const Fits: Story = { args: { children: 'report.pdf' } };

/** lines: up to six lines before the cut. */
export const Lines: Story = { args: { lines: 2, children: 'Checked against the March statement, with the two refunds from the supplier added back and the duplicate invoice taken out.' } };

const FILES = ['quarterly-report-final-version-2-reviewed-by-finance.pdf', 'logo.svg', 'invoice-2026-11-acme-industries-southeast-asia.xlsx'];
/** In a list of files: only the names that are cut take a tab stop. The grid's column is `minmax(0, 1fr)`, so a long name can't widen it. */
export const FileList: Story = {
  render: (args) => (
    <ul role="list" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
      {FILES.map((f) => <li key={f}><TruncatedText {...args}>{f}</TruncatedText></li>)}
    </ul>
  ),
};

const REPORTS = ['quarterly-report-final-version-2025.pdf', 'quarterly-report-final-version-2026.pdf', 'logo.svg'];
/** mode="middle": names told apart by their ends keep them in view, so the two reports still look different. */
export const Middle: Story = {
  render: (args) => (
    <ul role="list" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
      {REPORTS.map((f) => <li key={f}><TruncatedText {...args} mode="middle">{f}</TruncatedText></li>)}
    </ul>
  ),
};

/** In a link: the link keeps the one tab stop, and its keyboard focus shows the full text. */
export const InLink: Story = {
  render: (args) => <Link href="#file" style={{ display: 'block' }}><TruncatedText {...args} /></Link>,
};

/** placement: where the whole text shows. It flips when there's no room. */
export const Placement: Story = {
  argTypes: { placement: { control: 'select', options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
      {(['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end', 'left-start', 'left-end', 'right-start', 'right-end'] as const).map((p) => <TruncatedText key={p} {...args} placement={p}>{`${p}: ${args.children}`}</TruncatedText>)}
    </div>
  ),
};

// The stress story (G14): one long word, in a narrow column.
export const LongText: Story = {
  args: { lines: 2, children: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a label long enough to wrap twice in a narrow column' },
  decorators: [(Story) => box(160, <Story />)],
};
const statements = ['March', 'April', 'May'];
/** Do: what tells the rows apart at the start, where the cut never reaches. */
export const DoDifferenceFirst: Story = {
  name: 'Do: the difference first',
  render: () => <ul role="list" className="m-0 p-0 list-none flex flex-col gap-1">{statements.map((m) => <li key={m}><TruncatedText>{`${m} 2026 statement, account 0041 2290 8812`}</TruncatedText></li>)}</ul>,
};
/** Don't: the same words first: every row is cut to the same text. */
export const DontSameStart: Story = {
  name: "Don't: the same start",
  render: () => <ul role="list" className="m-0 p-0 list-none flex flex-col gap-1">{statements.map((m) => <li key={m}><TruncatedText>{`Statement for account 0041 2290 8812, ${m} 2026`}</TruncatedText></li>)}</ul>,
};
