// src/components/Chat/labels.ts
var en = {
  chatNewMessages: (count, formatted = String(count)) => count === 1 ? `${formatted} new message` : `${formatted} new messages`,
  chatLoadOlder: "Load earlier messages",
  chatLoadingOlder: "Loading earlier messages",
  chatSending: "Sending\u2026",
  chatNotSent: "Not sent",
  chatRetry: "Try again",
  chatYou: "You",
  chatMessage: "Message",
  chatSend: "Send",
  chatStop: "Stop",
  chatThinking: "Thinking\u2026",
  chatThoughtFor: (seconds) => seconds === 1 ? "Thought for 1 second" : `Thought for ${seconds} seconds`,
  chatReasoning: "Reasoning",
  chatStepRunning: "In progress",
  chatStepDone: "Done",
  chatStepFailed: "Failed",
  chatApprove: "Approve",
  chatDeny: "Deny",
  chatApproved: "Approved",
  chatDenied: "Denied",
  chatResponseOf: (i, c) => "Response " + i + " of " + c,
  chatPreviousResponse: "Previous response",
  chatNextResponse: "Next response"
};
var id = {
  chatNewMessages: (count, formatted = String(count)) => `${formatted} pesan baru`,
  chatLoadOlder: "Muat pesan sebelumnya",
  chatLoadingOlder: "Memuat pesan sebelumnya",
  chatSending: "Mengirim\u2026",
  chatNotSent: "Tidak terkirim",
  chatRetry: "Coba lagi",
  chatYou: "Anda",
  chatMessage: "Pesan",
  chatSend: "Kirim",
  chatStop: "Berhenti",
  chatThinking: "Berpikir\u2026",
  chatThoughtFor: (seconds) => `Berpikir selama ${seconds} detik`,
  chatReasoning: "Penalaran",
  chatStepRunning: "Berjalan",
  chatStepDone: "Selesai",
  chatStepFailed: "Gagal",
  chatApprove: "Setujui",
  chatDeny: "Tolak",
  chatApproved: "Disetujui",
  chatDenied: "Ditolak",
  chatResponseOf: (i, c) => "Jawaban " + i + " dari " + c,
  chatPreviousResponse: "Jawaban sebelumnya",
  chatNextResponse: "Jawaban berikutnya"
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
