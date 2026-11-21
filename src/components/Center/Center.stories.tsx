import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Center } from './Center';
import { Card } from '../Card/Card';
import { Heading } from '../Heading/Heading';
import { Button } from '../Button/Button';
import { Field } from '../Field/Field';
import { Input } from '../Input/Input';
import { Stack } from '../Stack/Stack';

const Box = ({ children }: { children?: React.ReactNode }) => <div className="rounded-md bg-surface-muted p-3 text-sm text-text">{children}</div>;

const meta = {
  title: 'Components/Layout and type/Center',
  component: Center,
  parameters: { layout: 'fullscreen' },
  args: { children: <Box>The content keeps to 448px, in the middle of the space it's in.</Box> },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Center>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The default: at most 448px (container-md) wide, in the middle, with 16px of side padding outside that width. */
export const Default: Story = {};

/** maxWidth takes a sizing token name or a CSS length: here container-sm (384px), container-md (448px) and container-2xl (672px). */
export const MaxWidths: Story = {
  name: 'Max widths',
  render: () => (
    <Stack gap={3} className="py-4">
      {['container-sm', 'container-md', 'container-2xl'].map((w) => <Center key={w} maxWidth={w}><Box>maxWidth="{w}"</Box></Center>)}
    </Stack>
  ),
};

/** vertical: a sign-in card in the middle of the screen, from top to bottom as well as side to side. */
export const Vertical: Story = {
  render: () => (
    <Center vertical maxWidth="container-sm">
      <Card>
        <Stack gap={4}>
          <Heading level={1} size="xl">Sign in</Heading>
          <Field label="Email"><Input type="email" autoComplete="email" /></Field>
          <Field label="Password"><Input type="password" autoComplete="current-password" /></Field>
          <Button>Sign in</Button>
        </Stack>
      </Card>
    </Center>
  ),
};

/** intrinsic and centerText: each child at its own width, centered, with its lines of text centered too, as an error page or an empty screen. */
export const Intrinsic: Story = {
  render: () => (
    <Center intrinsic centerText maxWidth="container-xl" className="py-12">
      <Stack gap={4} align="center">
        <Heading level={1} size="2xl">Page not found</Heading>
        <p className="m-0 text-text-muted">The page may have moved, or the link has a typo in it.</p>
        <Button>Go to the home page</Button>
      </Stack>
    </Center>
  ),
};

/** padded={false}: no side padding, for content inside something that already has it. */
export const NotPadded: Story = { name: 'No side padding', args: { padded: false } };

/** The stress story: a long word and a long line wrap inside the maximum width, never pushing the page sideways. */
export const LongText: Story = {
  args: { children: <Box><span className="wrap-anywhere">Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a line long enough to wrap two or three times inside the 448px column.</span></Box> },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: center a short, single task, such as signing in, with a maximum width that suits a form. */
export const DoSingleTask: Story = {
  name: 'Do: center one short task',
  render: () => <Center maxWidth="container-sm" className="py-6"><Card><Stack gap={3}><Heading level={2} size="lg">Reset your password</Heading><Field label="Email"><Input type="email" /></Field><Button>Send the link</Button></Stack></Card></Center>,
};
/** Don't: center long text: ragged starts on both sides make every line harder to find. */
export const DontCenterLongText: Story = {
  name: "Don't: center paragraphs",
  render: () => <Center centerText maxWidth="container-2xl" className="py-6"><p className="m-0">Long text with its lines centered starts each line at a different place, so the eye has to search for where the next one begins. Keep paragraphs aligned to the start, and center only a heading or a short line beside a button.</p></Center>,
};
