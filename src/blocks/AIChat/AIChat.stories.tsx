import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Card } from '../../components/Card/Card';
import { AIChat, type AIChatMessage } from './AIChat';

/* AI chat (RU20): a conversation with an assistant whose replies stream in, as a block an app copies. AIChat.mdx says
   what each part is for. The stories put it on a small page (a skip link, main and an h1). A pretend assistant streams
   its reply a few words at a time, so Send, Stop and Regenerate work in the story; each story opens still, so it
   draws the same every time. */
const answer = 'Linen and cotton are the coolest: both let air through and take up sweat. Linen dries faster, so it suits humid days; cotton is softer against the skin.';
const conversation: AIChatMessage[] = [
  { id: 'q1', role: 'user', text: 'Which fabric is coolest for a hot day?' },
  { id: 'a1', role: 'assistant', text: answer },
];
const suggestions = ['Which fabric is coolest for a hot day?', 'How do I wash linen?', 'What size should I order?'];

/** Keeps the messages in state and streams a reply word by word, so the story behaves like the real thing. */
function Live({ initial, labels }: { initial: readonly AIChatMessage[]; labels?: React.ComponentProps<typeof AIChat>['labels'] }) {
  const [messages, setMessages] = React.useState<AIChatMessage[]>(() => [...initial]);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearInterval(timer.current), []);
  const patch = (p: Partial<AIChatMessage>) => setMessages((m) => [...m.slice(0, -1), { ...m[m.length - 1]!, ...p }]);
  const stream = () => {
    const words = answer.split(' ');
    let at = 0;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      at += 2;
      if (at >= words.length) { window.clearInterval(timer.current); patch({ text: answer, streaming: false }); }
      else patch({ text: words.slice(0, at).join(' ') });
    }, 120);
  };
  return <AIChat className="h-96" messages={messages} suggestions={suggestions} labels={labels}
    onSend={(text) => { setMessages((m) => [...m, { id: 'q' + Date.now(), role: 'user', text }, { id: 'a' + Date.now(), role: 'assistant', text: '', streaming: true }]); stream(); }}
    onStop={() => { window.clearInterval(timer.current); patch({ streaming: false, stopped: true }); }}
    onRegenerate={() => { setMessages((m) => [...m.slice(0, -1), { id: 'a' + Date.now(), role: 'assistant', text: '', streaming: true }]); stream(); }} />;
}

function Page({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 outline-none">
    <Heading level={1}>Help</Heading><Card padding="lg">{children}</Card></main></div>;
}

const meta = {
  title: 'Blocks/AI chat',
  component: AIChat,
  parameters: { layout: 'fullscreen' },
  args: { messages: conversation, onSend: () => {} },
} satisfies Meta<typeof AIChat>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A question and its reply, with Copy and Regenerate. Send another to watch a reply stream in, and Stop it. */
export const Default: Story = { render: () => <Page><Live initial={conversation} /></Page> };

/** Nothing asked yet: suggested prompts as buttons; one sends itself, and focus waits in the message box. */
export const Empty: Story = { render: () => <Page><Live initial={[]} /></Page> };

/** A reply still arriving: busy, so a screen reader reads it once it's whole; Stop in place of Send, Copy and Regenerate off. */
export const Streaming: Story = {
  render: () => <Page><AIChat className="h-96" onSend={() => {}} onStop={() => {}} onRegenerate={() => {}}
    messages={[conversation[0]!, { id: 'a1', role: 'assistant', text: 'Linen and cotton are the coolest: both let air', streaming: true }]} /></Page>,
};

/** A reply stopped part way, and one that failed, each saying so in words; the failed one has Try again. */
export const StoppedAndFailed: Story = {
  name: 'Stopped and failed',
  render: () => <Page><AIChat className="h-96" onSend={() => {}} onRegenerate={() => {}} messages={[
    conversation[0]!, { id: 'a1', role: 'assistant', text: 'Linen and cotton are the coolest: both let air', stopped: true },
    { id: 'q2', role: 'user', text: 'How do I wash linen?' }, { id: 'a2', role: 'assistant', text: 'Wash it cool', error: 'The connection dropped before the reply was done.' },
  ]} /></Page>,
};

/** Every word is a label: here in Indonesian. */
export const Indonesian: Story = {
  render: () => <Page><Live initial={[]} labels={{ title: 'Asisten', assistant: 'Asisten', intro: 'Ajukan pertanyaan, atau mulai dengan salah satu ini.', suggestions: 'Saran',
    copy: 'Salin jawaban', regenerate: 'Buat ulang', stopped: 'Dihentikan', stoppedSaid: 'Jawaban dihentikan', tryAgain: 'Coba lagi' }} /></Page>,
};

/** A long question and a long reply wrap inside their bubbles; nothing is cut off. */
export const LongText: Story = {
  name: 'Long text',
  render: () => <Page><Live initial={[
    { id: 'q1', role: 'user', text: 'I am going somewhere hot and humid for a whole month in the middle of the rainy season, and I want to pack as little as possible: which fabrics should I bring, and which should I leave at home?' },
    { id: 'a1', role: 'assistant', text: answer + ' ' + answer + '\n\n' + answer },
  ]} /></Page>,
};
