import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { MaskedValue } from './MaskedValue';
import { DescriptionList, DescriptionItem } from '../DescriptionList/DescriptionList';

const meta = {
  title: 'Components/Content/MaskedValue',
  component: MaskedValue,
  args: { value: '4111111111111208', label: 'Card number' },
} satisfies Meta<typeof MaskedValue>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** A card number: the last four kept. */
export const Default: Story = {};
/** Revealable: a Show button for the person the value belongs to. */
export const Revealable: Story = { args: { value: 'sk_live_51Hq8f2KcX9vR', label: 'API key', start: 8, end: 0, revealable: true } };
/** Revealed: the whole value, with the Show button pressed. */
export const Revealed: Story = { args: { value: '+62 812 3456 7402', label: 'Phone', end: 3, revealable: true }, render: (args) => <MaskedValue {...args} revealed onRevealedChange={() => {}} /> };
/** Kinds of value, each keeping just enough to recognize it. */
export const Kinds: Story = {
  render: () => <DescriptionList layout="split" dividers>
    <DescriptionItem term="Card"><MaskedValue value="4111111111111208" label="Card number" /></DescriptionItem>
    <DescriptionItem term="Phone"><MaskedValue value="+6281234567402" label="Phone" end={3} /></DescriptionItem>
    <DescriptionItem term="Email"><MaskedValue value="ada@example.com" label="Email" start={1} end={0} /></DescriptionItem>
    <DescriptionItem term="Balance"><MaskedValue value="Rp 12.400.000" label="Balance" end={0} revealable /></DescriptionItem>
  </DescriptionList>,
};
// The stress story (G14): a long value in a narrow column, revealed, wraps rather than widening it.
export const LongText: Story = { args: { value: 'GB82WEST12345698765432GB82WEST12345698765432', label: 'Account number', revealable: true }, render: (args) => <div style={{ width: 200 }}><MaskedValue {...args} revealed onRevealedChange={() => {}} /></div> };
/** Do: keep the end the owner knows the card by. */
export const DoKeepTheEnd: Story = { name: 'Do: keep the last four' };
/** Don't: hide it all, so nobody can tell which card it is. */
export const DontHideAll: Story = { tags: ['!visual'], name: "Don't: hide it all", args: { end: 0 } };
