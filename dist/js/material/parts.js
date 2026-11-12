// src/material/parts.ts
var FIRST = ["10k", "add_business", "app_shortcut", "avg_pace", "book_3", "call_missed", "clock_loader_40", "credit_card_heart", "developer_mode_tv", "drive_export", "event_repeat", "filter_retrolux", "format_ink_highlighter", "grain", "highlight_alt", "inventory", "left_click", "magic_button", "money_off_csred", "nest_thermostat_gen_3", "oral_disease", "phone_callback", "priority", "replace_audio", "score", "settings_system_daydream", "snowboarding", "stat_3", "tab_new_right", "title", "unpin", "watch_vibration"];
var PARTS = [
  () => import("./part/00.js"),
  () => import("./part/01.js"),
  () => import("./part/02.js"),
  () => import("./part/03.js"),
  () => import("./part/04.js"),
  () => import("./part/05.js"),
  () => import("./part/06.js"),
  () => import("./part/07.js"),
  () => import("./part/08.js"),
  () => import("./part/09.js"),
  () => import("./part/10.js"),
  () => import("./part/11.js"),
  () => import("./part/12.js"),
  () => import("./part/13.js"),
  () => import("./part/14.js"),
  () => import("./part/15.js"),
  () => import("./part/16.js"),
  () => import("./part/17.js"),
  () => import("./part/18.js"),
  () => import("./part/19.js"),
  () => import("./part/20.js"),
  () => import("./part/21.js"),
  () => import("./part/22.js"),
  () => import("./part/23.js"),
  () => import("./part/24.js"),
  () => import("./part/25.js"),
  () => import("./part/26.js"),
  () => import("./part/27.js"),
  () => import("./part/28.js"),
  () => import("./part/29.js"),
  () => import("./part/30.js"),
  () => import("./part/31.js")
];
function partOf(name) {
  let i = 0;
  while (i + 1 < FIRST.length && FIRST[i + 1] <= name) i++;
  return i;
}
function loadPart(name) {
  return PARTS[partOf(name)]();
}
export {
  loadPart,
  partOf
};
//# sourceMappingURL=parts.js.map
