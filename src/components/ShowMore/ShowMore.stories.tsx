import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShowMore } from './ShowMore';

const REVIEW = 'Arrived two days early and well packed. The coffee is fresher than what I buy at the market: bright, a little fruity, and not bitter even as a strong espresso. I have ordered it three times now and it has been the same every time, which matters more to me than anything else. The 250 g bag lasts about two weeks for two people, so I have set up a monthly order.';

const meta = {
  title: 'Components/Content/ShowMore',
  component: ShowMore,
  args: { lines: 3, children: REVIEW },
  decorators: [(Story) => <div style={{ width: 'var(--spacing-80)', maxWidth: '100%' }}><Story /></div>],
} satisfies Meta<typeof ShowMore>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Open: all of the text, and the button says Show less. */
export const Expanded: Story = { args: { defaultExpanded: true } };
/** Short text that fits: no button. */
export const Short: Story = { args: { children: 'Fresh and well packed.' } };
/** Two paragraphs, cut after two lines. */
export const Paragraphs: Story = {
  args: { lines: 2, children: <><p>Our Toraja beans are grown at 1,400 m on smallholder farms around Rantepao, picked by hand and washed the same day.</p><p>We roast them medium on Mondays and ship within two days, so they reach you at their best.</p></> },
};
// The stress story (G14): long words and a long label; the visual baselines show how it copes.
export const LongText: Story = { args: { children: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung ' + REVIEW } };
