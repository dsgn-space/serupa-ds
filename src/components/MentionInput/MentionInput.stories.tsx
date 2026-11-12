import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Field } from '../Field/Field';
import { MentionInput, mentionsIn, type MentionOption } from './MentionInput';

const people: MentionOption[] = [
  { id: 'ayu', label: 'Ayu Lestari', description: 'Design lead' },
  { id: 'budi', label: 'Budi Santoso', description: 'Engineering' },
  { id: 'citra', label: 'Citra Dewi', description: 'Product' },
  { id: 'dimas', label: 'Dimas Pratama', description: 'Support' },
  { id: 'eka', label: 'Eka Putri', description: 'Can’t see this project', disabled: true },
];

const meta = {
  title: 'Components/Forms/MentionInput',
  component: MentionInput,
  args: { options: people, 'aria-label': 'Comment', placeholder: 'Add a comment. Type @ to mention someone.', rows: 3 },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }, options: { control: false } },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
} satisfies Meta<typeof MentionInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Some text with two mentions already in it. Type @ and a name to add another. */
export const Default: Story = { args: { defaultValue: 'Thanks @Ayu Lestari, this reads well. @Budi Santoso can you check the API part?' } };

// A comment box: the mentions are listed under it as they're put in, as the app would notify them on Send.
function Comment(args: React.ComponentProps<typeof MentionInput>) {
  const [text, setText] = React.useState('');
  const named = mentionsIn(text, people);
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <Field label="Comment" hint={named.length ? 'Will notify: ' + named.map((p) => p.label).join(', ') : 'Type @ to mention someone; they get a notification.'}>
        <MentionInput {...args} aria-label={undefined} value={text} onValueChange={setText} autoResize maxRows={8}
          actions={<Button size="sm" disabled={!text.trim()}>Comment</Button>} />
      </Field>
    </div>
  );
}
/** In a Field, with the people it will notify said under it. */
export const InAField: Story = { name: 'In a Field', render: (args) => <Comment {...args} /> };
export const Sizes: Story = {
  render: (args) => <div style={{ display: 'grid', gap: '12px' }}>
    {(['sm', 'md', 'lg'] as const).map((s) => <MentionInput key={s} {...args} size={s} aria-label={'Comment, ' + s} rows={2} defaultValue={'Size ' + s + ', with @Citra Dewi'} />)}
  </div>,
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Sent to @Dimas Pratama' } };
export const ReadOnly: Story = { name: 'Read only', args: { readOnly: true, defaultValue: 'Sent to @Dimas Pratama' } };
export const Invalid: Story = { args: { invalid: true, defaultValue: '@' } };
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: { defaultValue: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung, @Ayu Lestari, and a sentence long enough to wrap twice in a narrow column.' },
};
/** Say how it works under the field: "Type @ to mention someone" is the only way people learn the list is there. */
export const DoSayHow: Story = { name: 'Do: say how to mention', render: (args) => <Field label="Comment" hint="Type @ to mention someone."><MentionInput {...args} aria-label={undefined} placeholder={undefined} /></Field> };
/** Don't leave it unsaid: nothing on the field shows that @ does anything. */
export const DontHide: Story = { name: "Don't: hide that @ works", render: (args) => <Field label="Comment"><MentionInput {...args} aria-label={undefined} placeholder={undefined} /></Field> };
