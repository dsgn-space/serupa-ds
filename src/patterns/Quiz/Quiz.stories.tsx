import type { Meta, StoryObj } from '@storybook/react-vite';
import { Quiz } from './Quiz';

/* Quiz: questions as fieldsets, how many are answered, the questions left as a summary, then the score and why.
   Quiz.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Quiz',
  component: Quiz,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Quiz>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Five questions on accessible forms; one has more than one answer. */
export const Default: Story = {};

/** Two questions, both needed to pass. */
export const Short: Story = {
  args: {
    title: 'Colors: a quick check',
    pass: 2,
    questions: [
      { id: 'c1', question: 'What contrast does body text need against its background?', options: [{ value: '45', label: '4.5 to 1' }, { value: '3', label: '3 to 1' }, { value: '2', label: '2 to 1' }], answer: ['45'], why: 'Body text needs 4.5 to 1; large text and the edges of controls need 3 to 1.' },
      { id: 'c2', question: 'Can color alone say a field has a problem?', options: [{ value: 'no', label: 'No: say it in words too' }, { value: 'yes', label: 'Yes, if it’s red' }], answer: ['no'], why: 'Some people can’t tell red from other colors, and a screen reader doesn’t read color.' },
    ],
  },
};

/** While the quiz loads: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };
