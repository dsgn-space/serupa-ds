// TransferList's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TransferListLabels {
  /** TransferList: the two lists' names, the move buttons, and the box that checks every one in a list. */
  transferAvailable: string;
  transferChosen: string;
  transferAdd: string;
  transferRemove: string;
  transferAll: string;
  /** Why Add or Remove does nothing yet: the move buttons stay reachable and say this. */
  transferAddReason: string;
  transferRemoveReason: string;
  /** In a list with nothing in it. */
  transferEmpty: string;
  /** Said after a move: items is the moved ones' names as a list ("Email and Phone"), list the list they went to. */
  transferMoved: (items: string, list: string) => string;
}
export const en: TransferListLabels = {
  transferAvailable: 'Available',
  transferChosen: 'Chosen',
  transferAdd: 'Add',
  transferRemove: 'Remove',
  transferAll: 'All',
  transferAddReason: 'Check the ones to add first',
  transferRemoveReason: 'Check the ones to remove first',
  transferEmpty: 'None',
  transferMoved: (items, list) => items + ' moved to ' + list + '.',
};
export const id: TransferListLabels = {
  transferAvailable: 'Tersedia',
  transferChosen: 'Dipilih',
  transferAdd: 'Tambah',
  transferRemove: 'Hapus',
  transferAll: 'Semua',
  transferAddReason: 'Centang yang akan ditambah dulu',
  transferRemoveReason: 'Centang yang akan dihapus dulu',
  transferEmpty: 'Tidak ada',
  transferMoved: (items, list) => items + ' dipindah ke ' + list + '.',
};
