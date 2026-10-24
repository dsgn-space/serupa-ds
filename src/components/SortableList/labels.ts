// SortableList's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface SortableListLabels {
  /** SortableList: before an item's name on its handle ("Reorder Apollo"), the handle's instructions, and what it
      says as an item is picked up, moved, dropped or put back ("Apollo, position 2 of 5"). */
  reorder: string;
  reorderInstructions: string;
  reorderGrabbed: (item: string, position: number, total: number) => string;
  reorderMoved: (item: string, position: number, total: number) => string;
  reorderDropped: (item: string, position: number, total: number) => string;
  reorderCancelled: (item: string, position: number, total: number) => string;
}
export const en: SortableListLabels = {
  reorder: "Reorder",
  reorderInstructions: "Press Space to pick it up, the arrow keys to move it, Space again to drop it, or Escape to cancel.",
  reorderGrabbed: (item, p, n) => "Picked up " + item + ", position " + p + " of " + n + ".",
  reorderMoved: (item, p, n) => item + ", position " + p + " of " + n + ".",
  reorderDropped: (item, p, n) => "Dropped " + item + " at position " + p + " of " + n + ".",
  reorderCancelled: (item, p, n) => "Cancelled. " + item + " is back at position " + p + " of " + n + ".",
};
export const id: SortableListLabels = {
  reorder: "Ubah urutan",
  reorderInstructions: "Tekan Spasi untuk mengangkatnya, tombol panah untuk memindahkannya, Spasi lagi untuk meletakkannya, atau Escape untuk batal.",
  reorderGrabbed: (item, p, n) => item + " diangkat, posisi " + p + " dari " + n + ".",
  reorderMoved: (item, p, n) => item + ", posisi " + p + " dari " + n + ".",
  reorderDropped: (item, p, n) => item + " diletakkan di posisi " + p + " dari " + n + ".",
  reorderCancelled: (item, p, n) => "Batal. " + item + " kembali ke posisi " + p + " dari " + n + ".",
};
