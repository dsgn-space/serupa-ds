import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarLayout } from './SidebarLayout';
import { Card } from '../Card/Card';
import { Heading } from '../Heading/Heading';
import { Checkbox } from '../Checkbox/Checkbox';
import { Stack } from '../Stack/Stack';

const Box = ({ children, tall }: { children?: React.ReactNode; tall?: boolean }) => <div className={`rounded-md bg-surface-sunken p-3 text-sm text-text${tall ? ' min-h-40' : ''}`}>{children}</div>;

const meta = {
  title: 'Components/Layout and type/SidebarLayout',
  component: SidebarLayout,
  args: { sidebar: <Box>The narrow column, 256px</Box>, children: <Box tall>The wide column takes the rest. Make the window narrower: once it would be narrower than half, the narrow column moves above it.</Box> },
  argTypes: { sidebar: { control: false }, children: { control: false }, sidebarPlacement: { control: 'inline-radio', options: ['start', 'end'] }, align: { control: 'inline-radio', options: ['stretch', 'start'] } },
} satisfies Meta<typeof SidebarLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The default: the narrow column first, 256px, beside the wide one, 24px apart, both as tall as the taller. */
export const Default: Story = {};

/** sidebarPlacement="end": the narrow column after the wide one, in the HTML and on screen: a summary beside a form. */
export const SideAtEnd: Story = { name: 'Side at the end', args: { sidebarPlacement: 'end', sidebar: <Box>Order summary</Box>, children: <Box tall>The form people fill in</Box> } };

/** align="start": each column its own height, so a short side doesn't stretch down beside a long page. */
export const AlignStart: Story = { name: 'Align start', args: { align: 'start' } };

/** sidebarWidth and contentMin: a 320px side (container-xs), stacking once the content would be under 60% of the whole. */
export const WiderSide: Story = { name: 'Wider side', args: { sidebarWidth: 'container-xs', contentMin: 60, gap: 4 } };

/** Stacked: in a space too narrow for both (here 400px), the narrow column takes the full width above the wide one. */
export const Stacked: Story = { render: (args) => <div style={{ maxWidth: 400 }}><SidebarLayout {...args} /></div> };

/** Filters beside results, made of Cards: a list page that needs no CSS of its own. */
export const FiltersAndResults: Story = {
  name: 'Filters and results',
  render: () => (
    <SidebarLayout align="start" sidebar={
      <Card as="section" aria-labelledby="sl-filters">
        <Stack gap={3}>
          <Heading level={2} size="sm" id="sl-filters">Filters</Heading>
          <Checkbox defaultChecked>Open</Checkbox>
          <Checkbox>Closed</Checkbox>
          <Checkbox>Assigned to me</Checkbox>
        </Stack>
      </Card>}>
      <Stack as="ul" gap={3}>
        {['Website redesign', 'Mobile app', 'Billing migration'].map((r) => <Card as="li" key={r}>{r}</Card>)}
      </Stack>
    </SidebarLayout>
  ),
};

/** The stress story: long words in both columns wrap inside them, and the narrow column never pushes the wide one off the page. */
export const LongText: Story = {
  args: {
    sidebar: <Box><span className="wrap-anywhere">Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung, a filter label long enough to wrap</span></Box>,
    children: <Box tall><span className="wrap-anywhere">Rechtsschutzversicherungsgesellschaften and a paragraph long enough to wrap several times in the wide column, as a page's content does.</span></Box>,
  },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: put what helps people with the main content in the narrow column: filters, a summary, a page's sections. */
export const DoSupportingSide: Story = { name: 'Do: support the content', args: { sidebar: <Box>Filters</Box>, children: <Box tall>Results</Box> } };
/** Don't: put the page's main content in the narrow column: on a phone it comes first, and people scroll past it to find the rest. */
export const DontMainInSide: Story = { tags: ['!visual'], name: "Don't: the main content in the side", args: { sidebar: <Box tall>The article people came to read</Box>, children: <Box>Related links</Box> } };
