import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageSection } from './PageSection';
import { Heading } from '../Heading/Heading';
import { Button } from '../Button/Button';
import { Grid } from '../Grid/Grid';
import { Stack } from '../Stack/Stack';

const meta = {
  title: 'Components/Layout and type/PageSection',
  component: PageSection,
  parameters: { layout: 'fullscreen' },
  args: { 'aria-labelledby': 'ps-title', children: <><Heading level={2} id="ps-title">Everything in one place</Heading><p className="m-0 max-w-prose text-text-muted">One band of a long page: the background spans the page, and the content keeps to the Container's width.</p></> },
  argTypes: { children: { control: false }, tone: { control: 'inline-radio', options: ['plain', 'muted'] }, spacing: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }, align: { control: 'inline-radio', options: ['start', 'center'] }, size: { control: 'select', options: ['prose', 'md', 'lg', 'xl', '2xl', 'full'] } },
} satisfies Meta<typeof PageSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The default: the page's background, 48px above and below (64px from 768px), the content 1280px at most. */
export const Default: Story = {};

/** tone="muted" with a divider: a band set apart from the one above. */
export const Muted: Story = { args: { tone: 'muted', divider: true } };

/** spacing="lg", align="center", size="md": a hero, its heading, lead and buttons centered. */
export const Hero: Story = {
  args: {
    spacing: 'lg', align: 'center', size: 'md', gap: 6,
    children: <>
      <Heading level={1} size="4xl" id="ps-title">Plan the work. Ship it together.</Heading>
      <p className="m-0 text-lg text-text-muted">Projects, tasks and docs in one place, for teams of every size.</p>
      <Stack direction="row" wrap gap={3} justify="center"><Button size="lg">Start free</Button><Button size="lg" variant="secondary">See a demo</Button></Stack>
    </>,
  },
};

/** A band of features in a Grid: two columns from 640px. */
export const Features: Story = {
  args: {
    tone: 'muted', size: 'lg',
    children: <>
      <Heading level={2} id="ps-title">Built for the way you work</Heading>
      <Grid as="ul" columns={{ base: 1, sm: 2 }} gap={8}>
        {['Boards', 'Timelines', 'Docs', 'Reports'].map((f) => <li key={f}><Heading level={3} size="lg">{f}</Heading><p className="m-0 mt-1 text-text-muted">Everything about {f.toLowerCase()} stays in step with the rest of the plan.</p></li>)}
      </Grid>
    </>,
  },
};

/** spacing="sm": a short band, such as a row of logos or a note. */
export const Small: Story = { args: { spacing: 'sm', divider: true } };

/** The stress story: a long word in the heading and the text wraps inside the content's width. */
export const LongText: Story = {
  args: { children: <><Heading level={2} id="ps-title" className="wrap-anywhere">Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung</Heading><p className="m-0 max-w-prose wrap-anywhere">Rechtsschutzversicherungsgesellschaften and a sentence long enough to wrap two or three times in a narrow window.</p></> },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: alternate plain and muted bands, so each part of a long page reads as its own. */
export const DoAlternate: Story = {
  name: 'Do: alternate the bands',
  render: () => <>{(['plain', 'muted', 'plain'] as const).map((t, i) => <PageSection key={i} tone={t} spacing="sm" aria-label={'Band ' + (i + 1)}><p className="m-0">A {t} band</p></PageSection>)}</>,
};
/** Don't: put two muted bands one after the other: the line between them disappears. */
export const DontSameTone: Story = { tags: ['!visual'],
  name: "Don't: two muted bands in a row",
  render: () => <>{[1, 2].map((i) => <PageSection key={i} tone="muted" spacing="sm" aria-label={'Band ' + i}><p className="m-0">A muted band</p></PageSection>)}</>,
};
