import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../Avatar/Avatar';
import { Quote, type QuoteProps } from './Quote';
import { useName } from '../../../.storybook/content';

/* Who said it follows Storybook's Content menu (.storybook/content.ts), in the words and on the Avatar alike. */
function Said(args: QuoteProps) {
  const name = useName('Ada Rahman'), swap = (n: unknown) => (n === 'Ada Rahman' ? name : n);
  const avatar = React.isValidElement<{ name?: string }>(args.avatar) ? React.cloneElement(args.avatar, { name: swap(args.avatar.props.name) as string }) : args.avatar;
  return <Quote {...args} author={swap(args.author) as QuoteProps['author']} avatar={avatar} />;
}

const meta = {
  title: 'Components/Content/Quote',
  component: Quote,
  render: (args) => <Said {...args} />,
  args: {
    children: 'We moved our whole settings area onto it in a week, and the support tickets about it stopped.',
    author: 'Ada Rahman',
    source: 'Head of Product, Lumen',
  },
} satisfies Meta<typeof Quote>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = {};
/** With a picture of who said it, as a testimonial. */
export const WithAvatar: Story = { args: { avatar: <Avatar name="Ada Rahman" size="sm" alt="" /> } };
/** 'lg': a pull quote or a testimonial that leads a section. */
export const Large: Story = { args: { size: 'lg', avatar: <Avatar name="Ada Rahman" size="md" alt="" /> } };
/** Only the words: the source is said in the text around it. */
export const WordsOnly: Story = { args: { author: undefined, source: undefined } };
/** Several paragraphs, passed as <p> elements. */
export const Paragraphs: Story = {
  args: {
    children: (
      <>
        <p>The first release was rough. The second fixed almost everything we reported.</p>
        <p>By the third, we stopped keeping a list.</p>
      </>
    ),
  },
};
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: {
    children: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a quote long enough to wrap several times in a narrow column, because some people have a lot to say.',
    author: 'Maximiliane Wolfeschlegelsteinhausenbergerdorff',
    source: 'Senior Vice President of Customer Experience and Operations, Donaudampfschifffahrtsgesellschaft',
    avatar: <Avatar name="Maximiliane Wolfeschlegelsteinhausenbergerdorff" size="sm" alt="" />,
  },
};
