import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagGroup, type TagItem } from './TagGroup';

const labels: TagItem[] = [
  { id: 'design', label: 'Design' }, { id: 'bug', label: 'Bug' }, { id: 'checkout', label: 'Checkout' },
  { id: 'mobile', label: 'Mobile' }, { id: 'urgent', label: 'Urgent' },
];
const skills: TagItem[] = ['Research', 'Writing', 'Illustration', 'Typography', 'Motion', 'Prototyping', 'Accessibility', 'Data'].map((s) => ({ id: s.toLowerCase(), label: s }));

/** Keeps the tags in state, so removing works in the story. */
function Removable({ initial, ...rest }: { initial: TagItem[] } & Partial<React.ComponentProps<typeof TagGroup>>) {
  const [items, setItems] = React.useState(initial);
  return <TagGroup label="Labels" empty="No labels yet" {...rest} items={items} onRemove={(id) => setItems((t) => t.filter((x) => x.id !== id))} />;
}

const meta = {
  title: 'Components/Content/TagGroup',
  component: TagGroup,
  args: { label: 'Labels', items: labels },
} satisfies Meta<typeof TagGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Labels on a ticket, each with a ×. Tab to them, move with the arrow keys, and press Delete to remove one. */
export const Default: Story = { render: () => <Removable initial={labels} /> };
/** Skills to pick, several at once: a press or Space picks one, shown with a tick as well as its color. */
export const Selectable: Story = { args: { label: 'Skills', items: skills, selectionMode: 'multiple', defaultSelected: ['writing', 'motion'] } };
/** One choice: picking another clears the first. */
export const SingleChoice: Story = { name: 'Single choice', args: { label: 'Topic', items: skills.slice(0, 4), selectionMode: 'single', defaultSelected: ['research'] } };
/** A long list showing the first three, with Show more for the rest. */
export const Limited: Story = { args: { label: 'Skills', items: skills, max: 3 } };
/** Nothing yet: the empty text. */
export const Empty: Story = { args: { label: 'Labels', items: [], empty: 'No labels yet' } };
/** A tag that can't be removed (it was added by a rule) among ones that can. */
export const WithDisabled: Story = { name: 'With disabled', render: () => <Removable initial={[{ id: 'auto', label: 'Auto-assigned', disabled: true }, ...labels.slice(0, 3)]} /> };
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  render: () => <div style={{ maxWidth: 320 }}><Removable initial={[
    { id: 'a', label: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung' },
    { id: 'b', label: 'A label long enough to wrap twice in a narrow column of a phone screen' }, ...labels,
  ]} /></div>,
};
