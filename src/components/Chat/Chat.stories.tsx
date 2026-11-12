import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chat, ChatApproval, ChatCitation, ChatComposer, ChatDivider, ChatMessage, ChatSteps } from './Chat';
import type { ChatApprovalStatus } from './Chat';
import { HoverCard } from '../HoverCard/HoverCard';
import { Meter } from '../Meter/Meter';
import { Select } from '../Select/Select';
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

// An assistant at work: "Thinking…" until its words come, then how it got there (closed by default), the steps it took, and the reply.
export const AgentReply: Story = {
  name: 'Agent reply',
  render: (args) => <Frame>
    <Chat {...args} className="flex-auto">
      <ChatMessage own>Why was order 1042 refunded twice?</ChatMessage>
      <ChatMessage author="Assistant" reasoningTime={12} reasoning={'The customer asked about two refunds. I should check the payment log for order 1042, then the support tickets for the same day.'}
        steps={[
          { id: 'log', label: 'Read the payment log for order 1042', status: 'done', detail: '2 refunds, 3 minutes apart' },
          { id: 'tickets', label: 'Searched support tickets', status: 'done' },
          { id: 'bank', label: 'Checked the bank\'s status page', status: 'failed', detail: 'It didn\'t answer' },
        ]} branch={2} branches={3}>The refund button was pressed twice while the first refund was still processing. The second one went through because the payment provider didn't block duplicates. I can open a ticket to reverse it.</ChatMessage>
      <ChatMessage own>Yes, please.</ChatMessage>
      <ChatMessage author="Assistant" thinking steps={[{ id: 'ticket', label: 'Opening a ticket', status: 'running' }]} />
    </Chat>
    <ChatComposer placeholder="Ask the assistant" actions={<AgentTools />} />
  </Frame>,
};

// The composer's tools for an assistant: which model answers, and how much of its context is used, in words.
function AgentTools() {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flex: 'none' }}>
    <Select aria-label="Model" size="sm" defaultValue="balanced" style={{ inlineSize: 'var(--spacing-28)' }} options={[{ value: 'fast', label: 'Fast' }, { value: 'balanced', label: 'Balanced' }, { value: 'deep', label: 'Deep' }]} />
    <Meter aria-label="Context used" size="sm" value={12_400} max={200_000} style={{ inlineSize: 'var(--spacing-12)', flex: 'none' }}
      formatValue={(v, _min, max) => `${v.toLocaleString('en')} of ${max.toLocaleString('en')} tokens used`} />
  </div>;
}

// An assistant asks before it acts. Approve or Deny leaves a one-line record in its place, and focus moves to it.
export const Approval: Story = {
  render: function Render(args) {
    const [status, setStatus] = React.useState<ChatApprovalStatus>('pending');
    return <Frame>
      <Chat {...args} className="flex-auto">
        <ChatMessage own>Please reverse the second refund.</ChatMessage>
        <ChatMessage author="Assistant" attachments={
          <ChatApproval status={status} onApprove={() => setStatus('approved')} onDeny={() => setStatus('denied')}
            detail="Charges the customer's card again; they get an email.">Reverse refund 2 on order 1042 ($24.00)</ChatApproval>
        }>This needs your OK first.</ChatMessage>
      </Chat>
      <ChatComposer placeholder="Ask the assistant" />
    </Frame>;
  },
};

// Sources in a reply, as numbered links; the second opens a preview when the pointer or focus rests on it.
export const Citations: Story = {
  render: (args) => <Frame>
    <Chat {...args} className="flex-auto">
      <ChatMessage own>How long do refunds take?</ChatMessage>
      <ChatMessage author="Assistant">
        Card refunds take 5 to 10 business days to show up <ChatCitation href="https://docs.example.com/refunds" index={1} />, and bank transfers
        up to 3 days <HoverCard trigger={<ChatCitation href="https://www.example.com/help/transfers" index={2} />}>
          <strong>Bank transfers</strong><p>How long a transfer takes, and what to do when it's late.</p>
        </HoverCard>.
      </ChatMessage>
    </Chat>
    <ChatComposer placeholder="Ask the assistant" />
  </Frame>,
};

// Steps on their own, outside a message: each in progress, done or failed, in words as well as by its icon.
export const Steps: Story = {
  render: () => <div style={{ maxWidth: 420 }}><ChatSteps steps={[
    { id: 'a', label: 'Searched the help centre', status: 'done', detail: '3 articles' },
    { id: 'b', label: 'Called the orders API', status: 'failed', detail: 'Timed out after 10 seconds' },
    { id: 'c', label: 'Trying the orders API again', status: 'running' },
  ]} /></div>,
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
