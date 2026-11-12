import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { iconArg } from '../../../.storybook/icon-arg';

const meta = {
  title: 'Components/Content/Icon',
  component: Icon,
  args: { name: 'home' },
  argTypes: { name: iconArg, size: { control: 'number' } },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => <div className="flex items-end gap-4">{[16, 20, 24, 32, 40].map((s) => <Icon key={s} name="favorite" size={s} />)}</div>,
};

export const Color: Story = {
  render: () => <div className="flex gap-4 text-2xl">
    <span style={{ color: 'var(--text)' }}><Icon name="info" /></span>
    <span style={{ color: 'var(--primary)' }}><Icon name="check_circle" /></span>
    <span style={{ color: 'var(--danger-text)' }}><Icon name="error" /></span>
    <span style={{ color: 'var(--text-muted)' }}><Icon name="schedule" /></span>
  </div>,
};

export const CommonIcons: Story = {
  name: 'Common icons',
  render: () => <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
    {['add', 'close', 'check', 'search', 'menu', 'more_horiz', 'edit', 'delete', 'download', 'upload', 'settings', 'person', 'home', 'arrow_back', 'arrow_forward', 'expand_more', 'info', 'warning'].map((n) =>
      <div key={n} className="flex flex-col items-center gap-1 text-xs"><Icon name={n} aria-label={n} /><code className="wrap-anywhere text-center">{n}</code></div>)}
  </div>,
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
const row = (items: Array<[string, string]>) => (
  <ul role="list" style={{ display: 'grid', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
    {items.map(([name, label]) => <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name={name} />{label}</li>)}
  </ul>
);
/** Do: one icon for one meaning everywhere: `delete` wherever something is deleted. */
export const DoOneMeaning: Story = { name: 'Do: one icon per meaning', render: () => row([['delete', 'Delete file'], ['delete', 'Delete comment'], ['delete', 'Delete project']]) };
/** Don't: different icons for the same action, so people wonder whether they do different things. */
export const DontMixedIcons: Story = { name: "Don't: mix icons for one action", render: () => row([['delete', 'Delete file'], ['remove', 'Delete comment'], ['close', 'Delete project']]) };
