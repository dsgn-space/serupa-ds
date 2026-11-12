import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../Field';
import { Input } from '../Input';
import { Link } from '../Link';
import { ContextualHelp } from './ContextualHelp';

const meta = {
  title: 'Components/Overlays/ContextualHelp',
  component: ContextualHelp,
  args: {
    title: 'What is a workspace?',
    children: 'A workspace holds your team’s projects, members and billing. Most companies need only one.',
    variant: 'help',
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
      Workspace <ContextualHelp {...args} />
    </div>
  ),
} satisfies Meta<typeof ContextualHelp>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Open: the panel beside its button. */
export const Default: Story = { args: { defaultOpen: true } };
/** variant="info": extra facts about a value. */
export const Info: Story = { args: { variant: 'info', title: undefined, label: 'About the exchange rate', children: 'Rates update every hour from Bank Indonesia. The amount you pay is fixed when you confirm.', defaultOpen: true } };
/** Beside a field's label, with a link to more. */
export const InAField: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Field label={<>Tax ID <ContextualHelp label="Help: tax ID" title="Where to find it">It’s the 15-digit NPWP on your tax card. <Link href="#help">More about tax IDs</Link></ContextualHelp></>}>
        <Input />
      </Field>
    </div>
  ),
};
// The stress story (G14): a long title and text in the narrow panel; the visual baselines show how it copes.
export const LongText: Story = {
  args: {
    defaultOpen: true,
    title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung settings explained',
    children: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a sentence long enough to wrap several times inside the panel, so you can see where it stops.',
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: a sentence or two, and at most one link to more. */
export const DoShortHelp: Story = { name: 'Do: keep it to a sentence or two', args: { defaultOpen: true } };
/** Don't: a page of text in a 256px panel; link to a help page instead. */
export const DontLongHelp: Story = {
  name: "Don't: put a page of text in it",
  args: { defaultOpen: true, children: 'A workspace holds your team’s projects, members and billing. Each workspace has its own plan and invoices, and people can belong to several. Admins can add and remove members, change roles, set up single sign-on, export data, move projects between workspaces and close the workspace. Most companies need only one, but agencies often keep one per client so billing stays separate.' },
};
