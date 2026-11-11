// Chat's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ChatLabels {
  /** Chat: the button that jumps to the newest messages while the reader is further up, given how many arrived. */
  chatNewMessages: (count: number) => string;
  /** Chat: the button at the top that loads earlier messages, and what it says while they load. */
  chatLoadOlder: string;
  chatLoadingOlder: string;
  /** ChatMessage: under an own message on its way, and under one that didn't go, with its retry button. */
  chatSending: string;
  chatNotSent: string;
  chatRetry: string;
  /** ChatMessage: said before a message's text for screen readers when its author is "you". */
  chatYou: string;
  /** ChatComposer: the field's name, its send button and its stop button while a reply streams. */
  chatMessage: string;
  chatSend: string;
  chatStop: string;
  /** ChatMessage: the status line while a reply hasn't started, said once by screen readers. */
  chatThinking: string;
  /** ChatMessage: the reasoning section's toggle, given how many seconds it took, or without a time. */
  chatThoughtFor: (seconds: number) => string;
  chatReasoning: string;
  /** ChatSteps: each step's state in words, after its name. */
  chatStepRunning: string;
  chatStepDone: string;
  chatStepFailed: string;
  /** ChatApproval: its two buttons, and the record it leaves once the person answers. */
  chatApprove: string;
  chatDeny: string;
  chatApproved: string;
  chatDenied: string;
  /** ChatMessage: which of a regenerated reply's versions shows, given its number and how many, and the buttons between them. */
  chatResponseOf: (index: number, count: number) => string;
  chatPreviousResponse: string;
  chatNextResponse: string;
}
export const en: ChatLabels = {
  chatNewMessages: (count) => count === 1 ? '1 new message' : `${count} new messages`,
  chatLoadOlder: 'Load earlier messages',
  chatLoadingOlder: 'Loading earlier messages',
  chatSending: 'Sending…',
  chatNotSent: 'Not sent',
  chatRetry: 'Try again',
  chatYou: 'You',
  chatMessage: 'Message',
  chatSend: 'Send',
  chatStop: 'Stop',
  chatThinking: 'Thinking…',
  chatThoughtFor: (seconds) => seconds === 1 ? 'Thought for 1 second' : `Thought for ${seconds} seconds`,
  chatReasoning: 'Reasoning',
  chatStepRunning: 'In progress',
  chatStepDone: 'Done',
  chatStepFailed: 'Failed',
  chatApprove: 'Approve',
  chatDeny: 'Deny',
  chatApproved: 'Approved',
  chatDenied: 'Denied',
  chatResponseOf: (i, c) => 'Response ' + i + ' of ' + c,
  chatPreviousResponse: 'Previous response',
  chatNextResponse: 'Next response',
};
export const id: ChatLabels = {
  chatNewMessages: (count) => `${count} pesan baru`,
  chatLoadOlder: 'Muat pesan sebelumnya',
  chatLoadingOlder: 'Memuat pesan sebelumnya',
  chatSending: 'Mengirim…',
  chatNotSent: 'Tidak terkirim',
  chatRetry: 'Coba lagi',
  chatYou: 'Anda',
  chatMessage: 'Pesan',
  chatSend: 'Kirim',
  chatStop: 'Berhenti',
  chatThinking: 'Berpikir…',
  chatThoughtFor: (seconds) => `Berpikir selama ${seconds} detik`,
  chatReasoning: 'Penalaran',
  chatStepRunning: 'Berjalan',
  chatStepDone: 'Selesai',
  chatStepFailed: 'Gagal',
  chatApprove: 'Setujui',
  chatDeny: 'Tolak',
  chatApproved: 'Disetujui',
  chatDenied: 'Ditolak',
  chatResponseOf: (i, c) => 'Jawaban ' + i + ' dari ' + c,
  chatPreviousResponse: 'Jawaban sebelumnya',
  chatNextResponse: 'Jawaban berikutnya',
};
