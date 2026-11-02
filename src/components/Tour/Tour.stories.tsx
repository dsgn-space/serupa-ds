import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tour, type TourProps, type TourStep } from './Tour';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { SearchInput } from '../SearchInput/SearchInput';

// A small page for the tour to walk through: its parts are found by ref, so each story on the docs page has its own.
function Page(props: Omit<TourProps, 'steps'> & { steps?: (parts: Parts) => TourStep[]; start?: boolean }) {
  const search = React.useRef<HTMLDivElement>(null), create = React.useRef<HTMLButtonElement>(null), help = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(!!props.open);
  const { steps = basic, start, ...rest } = props;
  return (
    <div style={{ minHeight: 420, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div ref={search} style={{ flex: '1 1 200px' }}><SearchInput aria-label="Search projects" placeholder="Search projects" /></div>
        <Button ref={create} leftIcon="add">New project</Button>
        <IconButton ref={help} icon="help" label="Help" />
      </div>
      {start ? <p style={{ marginTop: 24 }}><Button variant="outline" onClick={() => setOpen(true)}>Take the tour</Button></p> : null}
      <Tour {...rest} steps={steps({ search, create, help })} open={open} onOpenChange={setOpen} />
    </div>
  );
}
type Parts = { search: React.RefObject<HTMLDivElement | null>; create: React.RefObject<HTMLButtonElement | null>; help: React.RefObject<HTMLButtonElement | null> };
const basic = (p: Parts): TourStep[] => [
  { target: p.search, title: 'Find a project', content: 'Search by name or owner. Results update as you type.' },
  { target: p.create, title: 'Start something new', content: 'New project opens a blank board you can share later.', placement: 'bottom-end' },
  { target: p.help, title: 'Help is here', content: 'Guides and shortcuts live behind this button, and you can take this tour again from there.', placement: 'left' },
];

// A story's render: the page with these steps.
function view(steps?: (p: Parts) => TourStep[]) {
  return function Render(args: TourProps, ctx: { viewMode?: string }) {
    const docs = ctx.viewMode === 'docs';
    return <Page {...args} steps={steps} open={!docs && args.open} start={docs || !args.open} />;
  };
}

const meta = {
  title: 'Components/Overlays/Tour',
  component: Tour,
  args: { steps: [] },
  argTypes: { steps: { control: false } },
  // On the docs page every story starts closed with a "Take the tour" button, so the open panels don't all take
  // focus and scroll the page; in its own canvas a story shows its step open, for the Storybook test in all six themes.
  render: view(),
} satisfies Meta<typeof Tour>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { open: true } };
export const Default: Story = { name: 'First step', args: { open: true } };
export const Middle: Story = { name: 'A middle step (Back and Next)', args: { open: true, defaultStep: 1 } };
export const Last: Story = { name: 'Last step (Done)', args: { open: true, defaultStep: 2 } };
// A welcome with nothing to point at sits in the middle of the screen.
export const Centered: Story = {
  name: 'No target: in the middle',
  args: { open: true },
  render: view((p: Parts) => [{ title: 'Welcome to Projects', content: 'A quick look at the three things you\'ll use most. It takes under a minute.' }, ...basic(p)]),
};
export const Closed: Story = { args: { open: false } };
// The stress story (G14): a long title and text in a narrow screen; the visual baselines show how it copes.
export const LongText: Story = {
  args: { open: true },
  render: view((p: Parts) => [{ target: p.create, title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung, a title long enough to wrap twice', content: 'A long explanation that keeps going, so the panel has to wrap its text across several lines and still keep its buttons in reach at the bottom, even on a narrow phone screen.' }]),
};
