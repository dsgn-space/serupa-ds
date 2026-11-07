// Kanban's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface KanbanLabels {
  /** Kanban: before a card's name on its handle ("Move Fix login"), and the handle's instructions. */
  kanbanMove: string;
  kanbanInstructions: string;
  /** Kanban: the "Move to…" menu button's name, given the card ("Move Fix login to…"), and the menu's heading. */
  kanbanMoveTo: (card: string) => string;
  /** Kanban: a column's count against its limit ("3 of 5"), both already written in the locale's digits. A column without a limit shows its count alone. */
  kanbanCount: (count: string, limit: string) => string;
  kanbanOverLimit: string;
  /** Kanban: what's said as a card is picked up, moved, dropped or put back. */
  kanbanGrabbed: (card: string, column: string, position: number, total: number) => string;
  kanbanMoved: (card: string, column: string, position: number, total: number) => string;
  kanbanDropped: (card: string, column: string, position: number, total: number) => string;
  kanbanCancelled: (card: string, column: string, position: number, total: number) => string;
  /** Kanban: an empty column. */
  kanbanEmpty: string;
}
export const en: KanbanLabels = {
  kanbanMove: 'Move',
  kanbanInstructions: 'Press Space to pick it up, the arrow keys to move it within and across columns, Space again to drop it, or Escape to cancel.',
  kanbanMoveTo: (card) => 'Move ' + card + ' to…',
  kanbanCount: (count, limit) => count + ' of ' + limit,
  kanbanOverLimit: 'Over limit',
  kanbanGrabbed: (card, column, p, n) => 'Picked up ' + card + '. ' + column + ', position ' + p + ' of ' + n + '.',
  kanbanMoved: (card, column, p, n) => card + ', ' + column + ', position ' + p + ' of ' + n + '.',
  kanbanDropped: (card, column, p, n) => card + ' moved to ' + column + ', position ' + p + ' of ' + n + '.',
  kanbanCancelled: (card, column, p, n) => 'Cancelled. ' + card + ' is back in ' + column + ', position ' + p + ' of ' + n + '.',
  kanbanEmpty: 'No cards',
};
export const id: KanbanLabels = {
  kanbanMove: 'Pindahkan',
  kanbanInstructions: 'Tekan Spasi untuk mengangkatnya, tombol panah untuk memindahkannya di dalam dan antarkolom, Spasi lagi untuk meletakkannya, atau Escape untuk batal.',
  kanbanMoveTo: (card) => 'Pindahkan ' + card + ' ke…',
  kanbanCount: (count, limit) => count + ' dari ' + limit,
  kanbanOverLimit: 'Melebihi batas',
  kanbanGrabbed: (card, column, p, n) => card + ' diangkat. ' + column + ', posisi ' + p + ' dari ' + n + '.',
  kanbanMoved: (card, column, p, n) => card + ', ' + column + ', posisi ' + p + ' dari ' + n + '.',
  kanbanDropped: (card, column, p, n) => card + ' dipindahkan ke ' + column + ', posisi ' + p + ' dari ' + n + '.',
  kanbanCancelled: (card, column, p, n) => 'Batal. ' + card + ' kembali ke ' + column + ', posisi ' + p + ' dari ' + n + '.',
  kanbanEmpty: 'Tidak ada kartu',
};
