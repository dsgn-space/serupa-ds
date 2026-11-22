import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyButton } from './CopyButton';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/Actions/CopyButton',
  component: CopyButton,
  args: { value: 'sk_live_51H8xQ2' },
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline', 'ghost'] }, size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof CopyButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const IconOnly: Story = { args: { iconOnly: true, children: 'Copy the API key', variant: 'ghost' } };
export const WithAField: Story = {
  name: 'Next to a field',
  render: () => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', alignItems: 'center', maxWidth: 'var(--container-sm)' }}>
    <Input readOnly value="https://serupa.app/invite/7Hq2" aria-label="Invite link" />
    <CopyButton value="https://serupa.app/invite/7Hq2" size="md">Copy link</CopyButton>
  </div>,
};

/** When the browser refuses (here, on purpose): press it to see the error icon and "Couldn’t copy" for two seconds. */
export const Failed: Story = { name: 'When copying fails', args: { value: () => Promise.reject(new Error('Refused')), children: 'Copy link', size: 'md' } };

export const LongLabel: Story = {
  render: (args) => (
    <div style={{ width: 200 }}>
      <CopyButton {...args}>Copy the secret API key to the clipboard</CopyButton>
    </div>
  ),
};

/** Every variant (outline by default) and size (sm by default), as a Button's, so it sits beside the field or toolbar it serves. */
export const VariantsAndSizes: Story = {
  render: (args) => <div className="flex flex-col gap-3 items-start">
    <div className="flex flex-wrap gap-3 items-center">
      {(['primary', 'secondary', 'outline', 'ghost', 'link'] as const).map((v) => <CopyButton key={v} {...args} variant={v}>{'Copy, ' + v}</CopyButton>)}
    </div>
    <div className="flex flex-wrap gap-3 items-center">
      {(['sm', 'md', 'lg'] as const).map((z) => <CopyButton key={z} {...args} size={z}>{'Copy, ' + z}</CopyButton>)}
    </div>
  </div>,
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: the text beside the button, so people see what they copy and can select it if copying fails. */
export const DoShowTheText: Story = { ...WithAField, name: 'Do: show the text too' };
/** Don't: a button alone, where people copy something they can't see. */
export const DontButtonAlone: Story = {
  name: "Don't: a button on its own",
  render: () => <CopyButton value="https://serupa.app/invite/7Hq2" size="md">Copy link</CopyButton>,
};
