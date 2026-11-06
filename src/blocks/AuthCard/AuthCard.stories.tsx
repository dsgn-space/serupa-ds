import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { AuthCard } from './AuthCard';

/* Sign-in card (BL9): the Sign-in pattern's card as a block an app places on its own page. AuthCard.mdx says what
   each part is for. The stories put it beside other content under the page's own h1, so the card's heading is an h2.
   The demo account is ada@example.com with the password "correct horse", and the code 123456; the checks wait a
   moment, as a server would. */
const later = <T,>(value: T) => new Promise<T>((resolve) => { window.setTimeout(() => resolve(value), 600); });
const check = (email: string, password: string) => later(email === 'ada@example.com' && password === 'correct horse');
const verify = (code: string) => later(code === '123456');

function Page({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 py-12 outline-none md:grid-cols-2">
    <div className="flex flex-col gap-4"><Heading level={1}>Welcome back to Acme</Heading><p className="text-text-muted">Your projects, files and team are where you left them.</p></div>
    {children}</main></div>;
}

const meta = {
  title: 'Blocks/Sign-in card',
  component: AuthCard,
  parameters: { layout: 'fullscreen' },
  args: { check, verify, forgotHref: '#forgot', doneHref: '#dashboard', headingLevel: 2 },
  render: (args) => <Page><AuthCard {...args} /></Page>,
} satisfies Meta<typeof AuthCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** On a page of your own, beside other content: the card's heading is an h2 under the page's h1. */
export const Default: Story = {};

/** Sent with nothing filled in: the error summary lists both problems and takes focus, and each field says its own. */
export const Errors: Story = { args: { failed: 'empty' } };

/** With the email from the last visit already filled in. */
export const RememberedEmail: Story = { args: { defaultEmail: 'ada@example.com' } };
