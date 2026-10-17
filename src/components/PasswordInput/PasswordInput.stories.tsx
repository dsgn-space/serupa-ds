import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordInput } from './PasswordInput';
import { Field } from '../Field/Field';

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  args: { 'aria-label': 'Password', placeholder: 'Your password' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: (args) => <div style={{ maxWidth: 320 }}><PasswordInput {...args} /></div>,
} satisfies Meta<typeof PasswordInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InAField: Story = {
  render: () => <div style={{ maxWidth: 320 }}><Field label="New password" hint="At least 12 characters"><PasswordInput autoComplete="new-password" /></Field></div>,
};

export const Shown: Story = { args: { defaultValue: 'correct horse battery staple', defaultVisible: true } };

export const Invalid: Story = {
  render: () => <div style={{ maxWidth: 320 }}><Field label="Password" error="That password is wrong."><PasswordInput defaultValue="hunter2" /></Field></div>,
};
