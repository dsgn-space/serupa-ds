// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Chat: h(D.Chat, { 'aria-label': 'Conversation' },
    h(D.ChatDivider, { key: 'd' }, 'Today'),
    h(D.ChatMessage, { key: 'a', author: 'Rina' }, 'Hi! How can I help?'),
    h(D.ChatMessage, { key: 'b', own: true, status: 'failed', onRetry: () => {} }, 'My invoice is wrong.')),
  ChatComposer: h(D.ChatComposer, { defaultValue: 'Hello' }),
  ChatSteps: h(D.ChatSteps, { steps: [{ id: 'a', label: 'Searched the help centre', status: 'done' }, { id: 'b', label: 'Reading order 1042', status: 'running' }] }),
  ChatApproval: h(D.ChatApproval, { detail: 'Charges the card again' }, 'Reverse refund 2'),
  ChatCitation: h(D.ChatCitation, { href: 'https://www.example.com/refunds', index: 1 }),
});
