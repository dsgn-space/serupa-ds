// src/internal/gridKeys.ts
import { addDays, startOfWeek } from "./dates.js";
import { isRtl } from "./position.js";
var gridKey = (e) => {
  switch (e.key) {
    case "ArrowLeft":
      return isRtl(e.currentTarget) ? "next" : "previous";
    case "ArrowRight":
      return isRtl(e.currentTarget) ? "previous" : "next";
    case "ArrowUp":
      return "up";
    case "ArrowDown":
      return "down";
    case "Home":
      return "rowStart";
    case "End":
      return "rowEnd";
    case "PageUp":
      return "pageUp";
    case "PageDown":
      return "pageDown";
    case "Enter":
    case " ":
      return "pick";
    default:
      return void 0;
  }
};
var periodCell = (k, focus, page, cols, count) => {
  const rowStart = focus - (focus - page) % cols;
  switch (k) {
    case "previous":
      return focus - 1;
    case "next":
      return focus + 1;
    case "up":
      return focus - cols;
    case "down":
      return focus + cols;
    case "rowStart":
      return rowStart;
    case "rowEnd":
      return Math.min(rowStart + cols - 1, page + count - 1);
    case "pageUp":
      return focus - count;
    case "pageDown":
      return focus + count;
  }
};
var dayCell = (k, focus, weekStartsOn) => {
  switch (k) {
    case "previous":
      return addDays(focus, -1);
    case "next":
      return addDays(focus, 1);
    case "up":
      return addDays(focus, -7);
    case "down":
      return addDays(focus, 7);
    case "rowStart":
      return startOfWeek(focus, weekStartsOn);
    case "rowEnd":
      return addDays(startOfWeek(focus, weekStartsOn), 6);
    default:
      return null;
  }
};
export {
  dayCell,
  gridKey,
  periodCell
};
//# sourceMappingURL=gridKeys.js.map
