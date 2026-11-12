import type { Meta, StoryObj } from '@storybook/react-vite';
import { SaveStatus } from './SaveStatus';

const meta = {
  title: 'Components/Feedback/SaveStatus',
  component: SaveStatus,
  args: { status: 'saved', savedAt: Date.now() - 2 * 60 * 1000 },
} satisfies Meta<typeof SaveStatus>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Saving: Story = { args: { status: 'saving' } };
export const Saved: Story = {};
export const SavedNoTime: Story = { args: { savedAt: undefined } };
export const Failed: Story = { args: { status: 'error', onRetry: () => {} } };
export const Idle: Story = { args: { status: 'idle' } };
// The stress story (G14): a long error in a narrow column; the text wraps and Try again moves to the next line.
export const LongText: Story = {
  args: { status: 'error', onRetry: () => {}, errorText: 'Couldn’t save: Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung rejected the change because the connection dropped', style: { maxWidth: 240 } },
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: say why a save failed and offer to try again. */
export const DoReasonAndRetry: Story = { name: 'Do: say why and offer a retry', args: { status: 'error', errorText: 'Couldn’t save: you’re offline', onRetry: () => {} } };
/** Don't: a failure with no reason and no way to try again. */
export const DontDeadEnd: Story = { name: "Don't: leave a dead end", args: { status: 'error' } };
