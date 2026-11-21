import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, type ButtonAsButtonProps } from './Button';
import { iconArg } from '../../../.storybook/icon-arg';
import { Tooltip } from '../Tooltip/Tooltip';
import { IconButton } from '../IconButton/IconButton';

const meta = {
  title: 'Components/Actions/Button',
  component: Button as React.ComponentType<ButtonAsButtonProps>,   // the <button> form; links are in As a link
  args: { children: 'Save changes', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline', 'ghost', 'link'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    leftIcon: iconArg,
    rightIcon: iconArg,
  },
} satisfies Meta<ButtonAsButtonProps>;
export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-3">{children}</div>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => <Row>
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </Row>,
};

// Over a photo: onMedia="dark" draws every variant in white, onMedia="light" in black, the same in all six themes.
// Each photo has a scrim (a dark or light wash) under the controls, so they keep 4.5:1 at its lightest or darkest point.
const DUSK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200"><defs><linearGradient id="a" x2="0" y2="1"><stop offset="0" stop-color="#2b3a67"/><stop offset="1" stop-color="#e0805a"/></linearGradient></defs><rect width="600" height="200" fill="url(#a)"/><path d="M0 160 Q150 110 300 150 T600 130 V200 H0Z" fill="#1b1f3a"/></svg>');
const NOON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200"><defs><linearGradient id="b" x2="0" y2="1"><stop offset="0" stop-color="#bfe3f7"/><stop offset="1" stop-color="#f6f1dc"/></linearGradient></defs><rect width="600" height="200" fill="url(#b)"/><path d="M0 170 Q200 130 380 165 T600 150 V200 H0Z" fill="#a9cf8e"/></svg>');
const Photo = ({ src, scrim, children }: { src: string; scrim: string; children: React.ReactNode }) => (
  <div style={{ padding: '24px', borderRadius: '12px', backgroundImage: `linear-gradient(${scrim}, ${scrim}), url("${src}")`, backgroundSize: 'cover' }}>{children}</div>
);
export const OnMedia: Story = {
  render: () => <div style={{ display: 'grid', gap: '16px' }}>
    <Photo src={DUSK} scrim="rgb(0 0 0 / 0.45)"><Row>
      <Button onMedia="dark">Book the tour</Button>
      <Button variant="outline" onMedia="dark">Tour details</Button>
      <Button variant="ghost" onMedia="dark">Save the tour</Button>
      <IconButton icon="share" label="Share the tour" onMedia="dark" />
    </Row></Photo>
    <Photo src={NOON} scrim="rgb(255 255 255 / 0.55)"><Row>
      <Button onMedia="light">Book a table</Button>
      <Button variant="outline" onMedia="light">See the menu</Button>
      <Button variant="ghost" onMedia="light">Save the place</Button>
      <IconButton icon="share" label="Share the place" onMedia="light" />
    </Row></Photo>
  </div>,
};

export const Destructive: Story = {
  render: () => <Row>
    <Button destructive>Delete</Button>
    <Button variant="secondary" destructive>Delete</Button>
    <Button variant="outline" destructive>Delete</Button>
    <Button variant="ghost" destructive>Remove</Button>
    <Button variant="link" destructive>Revoke</Button>
  </Row>,
};

export const Sizes: Story = {
  render: () => <Row>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </Row>,
};

export const Content: Story = {
  render: () => <Row>
    <Button>Label only</Button>
    <Button leftIcon="add">New project</Button>
    <Button variant="outline" rightIcon="arrow_forward">Next</Button>
    <IconButton icon="more_horiz" label="More actions" />
    <IconButton variant="primary" icon="add" label="Add" size="lg" />
  </Row>,
};

export const States: Story = {
  render: () => <Row>
    <Button>Default</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Saving</Button>
    <Button variant="outline" leftIcon="download">Export</Button>
    <IconButton icon="refresh" label="Refresh" loading />
  </Row>,
};

export const AsLink: Story = {
  name: 'As a link',
  render: () => <Row>
    <Button href="#docs" variant="outline" rightIcon="arrow_forward">Read the docs</Button>
    <Button href="#docs" variant="link">Inline link</Button>
    <Button href="#docs" disabled>Disabled link</Button>
  </Row>,
};

export const Loading: Story = {
  name: 'Loading on click',
  render: function LoadingDemo() {
    const [busy, setBusy] = React.useState(false);
    return <Button loading={busy} loadingLabel="Saving" onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 2000); }}>Save</Button>;
  },
};

/** disabledReason: a disabled button that stays focusable and says why, here with a Tooltip showing the same words. */
export const DisabledWithReason: Story = {
  render: (args) => (
    <Tooltip content="Enter your name first"><Button {...args} disabled disabledReason="Enter your name first">Save</Button></Tooltip>
  ),
};

/** An onClick that returns a promise: loading until it settles, then the successText with a check for 2 seconds. */
export const AsyncSuccess: Story = {
  render: (args) => <Button {...args} successText="Saved" onClick={() => new Promise((ok) => setTimeout(ok, 1200))}>Save changes</Button>,
};

/** A long label in a narrow column: cut with an ellipsis (the full label shows as its title on hover), or with wrap, on as many lines as it needs. */
export const LongLabel: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '160px' }}>
      <Button {...args}>Save every change to this document</Button>
      <Button {...args} wrap>Save every change to this document</Button>
    </div>
  ),
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: one primary button, the main action; the others quieter. */
export const DoOnePrimary: Story = {
  name: 'Do: one primary',
  render: () => <Row><Button variant="outline">Cancel</Button><Button variant="secondary">Preview</Button><Button>Publish</Button></Row>,
};
/** Don't: three primary buttons, so none reads as the main action. */
export const DontManyPrimaries: Story = {
  name: "Don't: many primaries",
  render: () => <Row><Button>Cancel</Button><Button>Preview</Button><Button>Publish</Button></Row>,
};
/** Do: labels that say what happens. */
export const DoVerbLabels: Story = {
  name: 'Do: verb labels',
  render: () => <Row><Button variant="outline">Keep project</Button><Button destructive>Delete project</Button></Row>,
};
/** Don't: Yes and No, which make people read the question again. */
export const DontVagueLabels: Story = {
  name: "Don't: vague labels",
  render: () => <Row><Button variant="outline">No</Button><Button destructive>Yes</Button></Row>,
};
