// CommandPalette's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface CommandPaletteLabels {
  /** CommandPalette: the dialog's name, and what its shortcut does in <KeyboardShortcuts>. */
  commandPalette: string;
  /** CommandPalette: the search field's placeholder and name. */
  searchCommands: string;
  /** CommandPalette: shown, and said, when nothing matches what was typed. */
  noCommands: string;
  /** CommandPalette: said once typing stops, with how many commands match. `formatted` is the count in the locale's
   *  digits and grouping; `count` is there for plural rules. */
  commandsCount: (count: number, formatted: string) => string;
  /** CommandPalette: the group for commands given no group. */
  otherCommands: string;
}
export const en: CommandPaletteLabels = {
  commandPalette: 'Command palette',
  searchCommands: 'Search commands and pages',
  noCommands: 'No matching commands',
  commandsCount: (count, formatted = String(count)) => formatted + (count === 1 ? ' command' : ' commands'),
  otherCommands: 'Commands',
};
export const id: CommandPaletteLabels = {
  commandPalette: 'Palet perintah',
  searchCommands: 'Cari perintah dan halaman',
  noCommands: 'Tidak ada perintah yang cocok',
  commandsCount: (count, formatted = String(count)) => formatted + ' perintah',
  otherCommands: 'Perintah',
};
