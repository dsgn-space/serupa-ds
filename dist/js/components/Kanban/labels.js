// src/components/Kanban/labels.ts
var en = {
  kanbanMove: "Move",
  kanbanInstructions: "Press Space to pick it up, the arrow keys to move it within and across columns, Space again to drop it, or Escape to cancel.",
  kanbanMoveTo: (card) => "Move " + card + " to\u2026",
  kanbanCount: (count, limit) => count + " of " + limit,
  kanbanOverLimit: "Over limit",
  kanbanGrabbed: (card, column, p, n) => "Picked up " + card + ". " + column + ", position " + p + " of " + n + ".",
  kanbanMoved: (card, column, p, n) => card + ", " + column + ", position " + p + " of " + n + ".",
  kanbanDropped: (card, column, p, n) => card + " moved to " + column + ", position " + p + " of " + n + ".",
  kanbanCancelled: (card, column, p, n) => "Canceled. " + card + " is back in " + column + ", position " + p + " of " + n + ".",
  kanbanEmpty: "No cards"
};
var id = {
  kanbanMove: "Pindahkan",
  kanbanInstructions: "Tekan Spasi untuk mengangkatnya, tombol panah untuk memindahkannya di dalam dan antarkolom, Spasi lagi untuk meletakkannya, atau Escape untuk batal.",
  kanbanMoveTo: (card) => "Pindahkan " + card + " ke\u2026",
  kanbanCount: (count, limit) => count + " dari " + limit,
  kanbanOverLimit: "Melebihi batas",
  kanbanGrabbed: (card, column, p, n) => card + " diangkat. " + column + ", posisi " + p + " dari " + n + ".",
  kanbanMoved: (card, column, p, n) => card + ", " + column + ", posisi " + p + " dari " + n + ".",
  kanbanDropped: (card, column, p, n) => card + " dipindahkan ke " + column + ", posisi " + p + " dari " + n + ".",
  kanbanCancelled: (card, column, p, n) => "Batal. " + card + " kembali ke " + column + ", posisi " + p + " dari " + n + ".",
  kanbanEmpty: "Tidak ada kartu"
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
