// Drawer's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DrawerLabels {
  /** Drawer with snapPoints: the handle at its top, when a press makes it taller. */
  drawerExpand: string;
  /** Drawer with snapPoints: the handle at its top, at its tallest, when a press takes it back to the shortest. */
  drawerCollapse: string;
}
export const en: DrawerLabels = { drawerExpand: 'Expand', drawerCollapse: 'Collapse' };
export const id: DrawerLabels = { drawerExpand: 'Perluas', drawerCollapse: 'Ciutkan' };
