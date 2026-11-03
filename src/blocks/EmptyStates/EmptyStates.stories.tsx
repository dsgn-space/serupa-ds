import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { EmptyFirstRun, EmptyLoadFailed, EmptyNoAccess, EmptyNoResults } from './EmptyStates';

/* Empty states (BL5): the four empties most apps need, each with its next step, as blocks an app copies.
   EmptyStates.mdx says when to use each. The stories put them on a small page (a skip link, main and an h1). */
const wait = () => new Promise((resolve) => { window.setTimeout(resolve, 600); });

function Page({ children, title }: { children: React.ReactNode; title: string }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 outline-none"><Heading level={1}>{title}</Heading><Card padding="lg">{children}</Card></main></div>;
}

const meta = {
  title: 'Blocks/Empty states',
  component: EmptyFirstRun,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EmptyFirstRun>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first visit: what this place is for, the button that makes the first one, and a guide for people who want to read first. */
export const FirstRun: Story = {
  args: { title: 'No projects yet', description: 'Projects keep your tasks, files and people together. Start one to see it here.', createLabel: 'New project', onCreate: () => {}, learnHref: '#guide', headingLevel: 2 },
  render: (args) => <Page title="Projects"><EmptyFirstRun {...args} /></Page>,
};

/** A search that found nothing: the query in the title, a spelling to try, and Clear filters. Said once as it appears. */
export const NoResults: Story = {
  args: FirstRun.args,
  render: () => <Page title="Projects"><EmptyNoResults query="websit redesign" suggestions={['website redesign']} onSuggestion={() => {}} onClearFilters={() => {}} headingLevel={2} /></Page>,
};

/** A page the person can't see: who owns it, Request access (which then says it's sent), and a way back. */
export const NoAccess: Story = {
  args: FirstRun.args,
  render: () => <Page title="Billing migration"><EmptyNoAccess description="Ana Putri owns this project. Ask them, or request access here and we'll email them." onRequest={wait} backHref="#projects" backLabel="Back to projects" headingLevel={2} /></Page>,
};

/** Loading failed: what to do, Try again, and a reference to give support. Said once as it appears. */
export const LoadFailed: Story = {
  args: FirstRun.args,
  render: () => <Page title="Projects"><EmptyLoadFailed onRetry={wait} reference="7F3A-91" headingLevel={2} /></Page>,
};
