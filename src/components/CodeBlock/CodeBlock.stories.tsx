import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from './CodeBlock';

const APP = `import { Button, Field, Input } from "serupa-ds";

export function SignIn() {
  return (
    <form>
      <Field label="Email"><Input type="email" autoComplete="email" /></Field>
      <Button type="submit">Sign in</Button>
    </form>
  );
}`;
const meta = {
  title: 'Components/Content/CodeBlock',
  component: CodeBlock,
  args: { code: APP, language: 'tsx', title: 'SignIn.tsx' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-md)' }}><Story /></div>],
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = {};
export const LanguageOnly: Story = { name: 'Language, no title', args: { title: undefined, language: 'sh', code: 'npm install serupa-ds\nnpx serupa-brand acme "#0f766e" -o src/acme-theme.css' } };
export const LineNumbers: Story = { args: { lineNumbers: true, highlight: [1, [6, 7]] } };
export const StartLine: Story = { name: 'Numbered from line 41', args: { lineNumbers: true, startLine: 41, highlight: [44], code: APP.split('\n').slice(2, 9).join('\n'), title: 'SignIn.tsx, lines 41 to 47' } };
export const Wrap: Story = { name: 'Wrapping long lines', args: { wrap: true, code: 'const message = "A line long enough that it would scroll sideways in a narrow box, unless the block wraps it onto the next line instead.";' } };
export const NoCopy: Story = { name: 'Without the copy button', args: { copyable: false, title: undefined, language: undefined, code: 'SELECT name, email FROM users WHERE active = true;' } };
// The stress story (G14): long words, long lines and a narrow column; the visual baselines show how it copes.
export const LongText: Story = {
  args: {
    title: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung.config.ts and a title long enough to wrap',
    lineNumbers: true,
    code: Array.from({ length: 12 }, (_, i) => `const line${i + 1} = "Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung";`).join('\n'),
  },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};
