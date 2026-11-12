import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chat, ChatComposer, ChatDivider, ChatMessage } from './Chat';
import { Avatar } from '../Avatar/Avatar';
import { Attachment } from '../Attachment/Attachment';
import { useName } from '../../../.storybook/content';

const meta = {
  title: 'Components/Content/Chat',
  component: Chat,
  args: { 'aria-label': 'Conversation with Support' },
} satisfies Meta<typeof Chat>;
export default meta;
type Story = StoryObj<typeof meta>;

// A fixed moment, so the times read the same in every picture.
const at = (min: number) => new Date(Date.UTC(2026, 9, 24, 9, 0) + min * 60_000);
const Frame = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col border rounded-lg" style={{ height: 460, maxWidth: 520 }}>{children}</div>;
// The support agent follows Storybook's Content menu (a long name in the worst case).
const Conversation = (props: { sending?: boolean; failed?: boolean }) => { const name = useName('Rina Kusuma'), Rina = <Avatar size="sm" name={name} />; return <>
  <ChatDivider date={at(0)}>24 Oct 2026</ChatDivider>
  <ChatMessage author={name} avatar={Rina} time={at(0)}>Hi! How can I help you today?</ChatMessage>
  <ChatMessage own time={at(1)}>My invoice for March shows the wrong address.</ChatMessage>
  <ChatMessage own hideAuthor attachments={<Attachment name="Invoice March 2026.pdf" bytes={1_482_000} href="#invoice" />}>Here it is.</ChatMessage>
  <ChatMessage author={name} avatar={Rina} time={at(4)}>Thanks, I can see it. I've corrected the address to Jl. Sudirman 12, Jakarta.</ChatMessage>
  <ChatMessage author={name} avatar={Rina} hideAuthor>A new invoice is on its way to your inbox.</ChatMessage>
  {props.sending ? <ChatMessage own status="sending">Great, thank you!</ChatMessage> : null}
  {props.failed ? <ChatMessage own status="failed" onRetry={() => {}}>Can you also send the receipt?</ChatMessage> : null}
</>; };

export const Playground: Story = {
  render: (args) => <Frame><Chat {...args} className="flex-auto"><Conversation /></Chat><ChatComposer /></Frame>,
};

// Own messages on their way and one that didn't go, with "Try again".
export const Statuses: Story = {
  render: (args) => <Frame><Chat {...args} className="flex-auto"><Conversation sending failed /></Chat><ChatComposer defaultValue="Draft reply" /></Frame>,
};

// "Load earlier messages" at the top, and the button while they load.
export const Older: Story = {
  render: (args) => <Frame><Chat {...args} className="flex-auto" hasOlder onLoadOlder={() => {}}><Conversation /></Chat></Frame>,
};
export const LoadingOlder: Story = {
  name: 'Loading older',
  render: (args) => <Frame><Chat {...args} className="flex-auto" hasOlder loadingOlder><Conversation /></Chat></Frame>,
};

// An assistant's reply streaming in: the composer's send button is a stop button.
export const Streaming: Story = {
  render: (args) => <Frame>
    <Chat {...args} className="flex-auto">
      <ChatMessage own>Summarise this contract in three points.</ChatMessage>
      <ChatMessage author="Assistant" streaming>1. The term is 12 months, renewing</ChatMessage>
    </Chat>
    <ChatComposer streaming onStop={() => {}} />
  </Frame>,
};

// Files about to be sent above the field, and an attach button beside it.
export const ComposerWithFiles: Story = {
  name: 'Composer with files',
  render: () => <div style={{ maxWidth: 520 }}><ChatComposer defaultValue="Both photos attached."
    attachments={<><Attachment name="Site photo.jpg" bytes={3_400_000} progress={60} onRemove={() => {}} /><Attachment name="Floor plan.png" bytes={820_000} onRemove={() => {}} /></>} /></div>,
};

export const Disabled: Story = { render: () => <div style={{ maxWidth: 520 }}><ChatComposer disabled placeholder="This conversation is closed" /></div> };

// An empty conversation: just the composer under it.
export const Empty: Story = { render: (args) => <Frame><Chat {...args} className="flex-auto" /><ChatComposer placeholder="Ask anything" /></Frame> };

// The stress story (G14): long words, long names, emoji, right-to-left text.
export const LongText: Story = {
  render: (args) => <Frame><Chat {...args} className="flex-auto">
    <ChatDivider>Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung</ChatDivider>
    <ChatMessage author="Raden Ajeng Kartini Djojo Adhiningrat Soerjaningrat" avatar={<Avatar size="sm" name="Raden Ajeng" />} time={at(0)}>Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung 🎉🎉 and a sentence long enough to wrap twice in a narrow conversation.</ChatMessage>
    <ChatMessage own time={at(2)}>{'Line one\nLine two after a break'}</ChatMessage>
    <ChatMessage author="سارة">مرحبا، كيف يمكنني مساعدتك؟</ChatMessage>
  </Chat></Frame>,
};

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
const Rina = <Avatar size="sm" name="Rina Kusuma" />;
/** Do: a ChatDivider with the date where the day changes. */
export const DoDateDividers: Story = {
  name: 'Do: mark where the day changes',
  render: (args) => <Frame><Chat {...args} className="flex-auto">
    <ChatDivider date={at(-1440)}>23 Oct 2026</ChatDivider>
    <ChatMessage own time={at(-1440)}>Is the March invoice ready?</ChatMessage>
    <ChatDivider date={at(0)}>24 Oct 2026</ChatDivider>
    <ChatMessage author="Rina Kusuma" avatar={Rina} time={at(0)}>Yes, it's on its way to your inbox.</ChatMessage>
  </Chat></Frame>,
};
/** Don't: messages from different days run together, so "yesterday" and "today" can't be told apart. */
export const DontNoDividers: Story = {
  name: "Don't: run the days together",
  render: (args) => <Frame><Chat {...args} className="flex-auto">
    <ChatMessage own time={at(-1440)}>Is the March invoice ready?</ChatMessage>
    <ChatMessage author="Rina Kusuma" avatar={Rina} time={at(0)}>Yes, it's on its way to your inbox.</ChatMessage>
  </Chat></Frame>,
};
