// Chat's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ChatLabels {
  /** Chat: the button that jumps to the newest messages while the reader is further up, given how many arrived. */
  chatNewMessages: (count: number, formatted: string) => string;
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
}
export const en: ChatLabels = {
  chatNewMessages: (count, formatted = String(count)) => count === 1 ? `${formatted} new message` : `${formatted} new messages`,
  chatLoadOlder: 'Load earlier messages',
  chatLoadingOlder: 'Loading earlier messages',
  chatSending: 'Sending…',
  chatNotSent: 'Not sent',
  chatRetry: 'Try again',
  chatYou: 'You',
  chatMessage: 'Message',
  chatSend: 'Send',
  chatStop: 'Stop',
};
export const id: ChatLabels = {
  chatNewMessages: (count, formatted = String(count)) => `${formatted} pesan baru`,
  chatLoadOlder: 'Muat pesan sebelumnya',
  chatLoadingOlder: 'Memuat pesan sebelumnya',
  chatSending: 'Mengirim…',
  chatNotSent: 'Tidak terkirim',
  chatRetry: 'Coba lagi',
  chatYou: 'Anda',
  chatMessage: 'Pesan',
  chatSend: 'Kirim',
  chatStop: 'Berhenti',
};
