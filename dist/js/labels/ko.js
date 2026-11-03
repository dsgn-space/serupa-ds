// src/labels/ko.ts
var locale = "ko";
var n = (x) => new Intl.NumberFormat("ko").format(x);
var HUES = { red: "\uBE68\uAC04\uC0C9", orange: "\uC8FC\uD669\uC0C9", yellow: "\uB178\uB780\uC0C9", green: "\uCD08\uB85D\uC0C9", teal: "\uCCAD\uB85D\uC0C9", blue: "\uD30C\uB780\uC0C9", purple: "\uBCF4\uB77C\uC0C9", pink: "\uBD84\uD64D\uC0C9", brown: "\uAC08\uC0C9", gray: "\uD68C\uC0C9", black: "\uAC80\uC740\uC0C9", white: "\uD770\uC0C9" };
var STATUS = { online: "\uC628\uB77C\uC778", busy: "\uB2E4\uB978 \uC6A9\uBB34 \uC911", away: "\uC790\uB9AC \uBE44\uC6C0", offline: "\uC624\uD504\uB77C\uC778" };
var ZONES = { low: "\uB0AE\uC74C", medium: "\uBCF4\uD1B5", high: "\uB192\uC74C" };
var KINDS = { image: "\uC774\uBBF8\uC9C0", video: "\uB3D9\uC601\uC0C1", "audio file": "\uC624\uB514\uC624 \uD30C\uC77C", "text file": "\uD14D\uC2A4\uD2B8 \uD30C\uC77C" };
var KEYS = {
  "Up arrow": "\uC704\uCABD \uD654\uC0B4\uD45C",
  "Down arrow": "\uC544\uB798\uCABD \uD654\uC0B4\uD45C",
  "Left arrow": "\uC67C\uCABD \uD654\uC0B4\uD45C",
  "Right arrow": "\uC624\uB978\uCABD \uD654\uC0B4\uD45C",
  Space: "\uC2A4\uD398\uC774\uC2A4",
  Delete: "Delete",
  Backspace: "\uBC31\uC2A4\uD398\uC774\uC2A4",
  Enter: "Enter",
  Escape: "Esc",
  Function: "Fn"
};
var eul = (w) => {
  const c = w.charCodeAt(w.length - 1);
  return c >= 44032 && c <= 55203 && (c - 44032) % 28 ? "\uC744" : "\uB97C";
};
var ga = (w) => {
  const c = w.charCodeAt(w.length - 1);
  return c >= 44032 && c <= 55203 && (c - 44032) % 28 ? "\uC774" : "\uAC00";
};
var labels = {
  expandAll: "\uBAA8\uB450 \uD3BC\uCE58\uAE30",
  collapseAll: "\uBAA8\uB450 \uC811\uAE30",
  avatarStatus: (status) => STATUS[status],
  avatarMore: (count) => "\uC678 " + n(count) + "\uBA85",
  breadcrumb: "\uD0D0\uC0C9 \uACBD\uB85C",
  showHiddenPages: "\uBAA8\uB4E0 \uD398\uC774\uC9C0 \uBCF4\uAE30",
  morePages: "\uD398\uC774\uC9C0 \uB354 \uBCF4\uAE30",
  previousMonth: "\uC774\uC804 \uB2EC",
  nextMonth: "\uB2E4\uC74C \uB2EC",
  month: "\uC6D4",
  year: "\uC5F0\uB3C4",
  previousSlide: "\uC774\uC804 \uC2AC\uB77C\uC774\uB4DC",
  nextSlide: "\uB2E4\uC74C \uC2AC\uB77C\uC774\uB4DC",
  slideOf: (slide, total) => total + "\uAC1C \uC911 " + slide + "\uBC88\uC9F8",
  slidesOf: (first, last, total) => total + "\uAC1C \uC911 " + first + "\u2013" + last + "\uBC88\uC9F8",
  carouselRole: "\uCE90\uB7EC\uC140",
  slideRole: "\uC2AC\uB77C\uC774\uB4DC",
  selectAtLeastOne: "\uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD558\uC138\uC694.",
  commandPalette: "\uBA85\uB839 \uD314\uB808\uD2B8",
  searchCommands: "\uBA85\uB839\uACFC \uD398\uC774\uC9C0 \uAC80\uC0C9",
  noCommands: "\uC77C\uCE58\uD558\uB294 \uBA85\uB839\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
  commandsCount: (count) => "\uBA85\uB839 " + n(count) + "\uAC1C",
  otherCommands: "\uBA85\uB839",
  colorName: (hue, tone) => (tone === "light" ? "\uBC1D\uC740 " : tone === "dark" ? "\uC5B4\uB450\uC6B4 " : "") + HUES[hue],
  customColor: "\uC0AC\uC6A9\uC790 \uC9C0\uC815 \uC0C9\uC0C1",
  hexCode: "16\uC9C4\uC218 \uCF54\uB4DC",
  contrast: (ratio) => "\uBA85\uC554\uBE44 " + ratio + ":1",
  lowContrast: (min) => min + ":1 \uBBF8\uB9CC\uC774\uB77C \uC77D\uAE30 \uC5B4\uB824\uC6B8 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
  loadingResults: "\uBD88\uB7EC\uC624\uB294 \uC911\u2026",
  loadFailed: "\uC635\uC158\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC785\uB825\uD558\uBA74 \uB2E4\uC2DC \uC2DC\uB3C4\uD569\uB2C8\uB2E4.",
  noResults: "\uACB0\uACFC \uC5C6\uC74C",
  resultsCount: (count) => "\uACB0\uACFC " + n(count) + "\uAC1C",
  showOptions: "\uC635\uC158 \uBCF4\uAE30",
  clearValue: (label) => label ? label + " \uC9C0\uC6B0\uAE30" : "\uC9C0\uC6B0\uAE30",
  createOption: (text) => "\u201C" + text + "\u201D \uCD94\uAC00",
  valueAdded: (label) => label + " \uCD94\uAC00\uB428",
  valueRemoved: (label) => label + " \uC0AD\uC81C\uB428",
  copied: "\uBCF5\uC0AC\uB428",
  copyFailed: "\uBCF5\uC0AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uD14D\uC2A4\uD2B8\uB97C \uC120\uD0DD\uD574 \uC9C1\uC811 \uBCF5\uC0AC\uD558\uC138\uC694.",
  discardTitle: "\uBCC0\uACBD \uC0AC\uD56D\uC744 \uBC84\uB9B4\uAE4C\uC694?",
  discardDescription: "\uC5EC\uAE30\uC11C \uBC14\uAFBC \uB0B4\uC6A9\uC740 \uC544\uC9C1 \uC800\uC7A5\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  discard: "\uBC84\uB9AC\uAE30",
  keepEditing: "\uACC4\uC18D \uD3B8\uC9D1",
  chooseDate: "\uB0A0\uC9DC \uC120\uD0DD",
  inputNotAccepted: (text) => `\u2018${text}\u2019${ga(text)} \uBC1B\uC544\uB4E4\uC5EC\uC9C0\uC9C0 \uC54A\uC544 \uC774\uC804 \uAC12\uC744 \uC720\uC9C0\uD588\uC2B5\uB2C8\uB2E4.`,
  formatHint: (pattern) => "\uD615\uC2DD: " + pattern,
  chooseDates: "\uAE30\uAC04 \uC120\uD0DD",
  startDate: "\uC2DC\uC791\uC77C",
  endDate: "\uC885\uB8CC\uC77C",
  chooseStartDate: "\uC2DC\uC791\uC77C \uC120\uD0DD",
  chooseEndDate: "\uC885\uB8CC\uC77C \uC120\uD0DD",
  didYouMean: "\uC774\uAC83\uC744 \uCC3E\uC73C\uC168\uB098\uC694:",
  clearFilters: "\uD544\uD130 \uC9C0\uC6B0\uAE30",
  errorTitle: "\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4",
  errorDescription: "\uD398\uC774\uC9C0\uC758 \uC774 \uBD80\uBD84\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  tryAgain: "\uB2E4\uC2DC \uC2DC\uB3C4",
  errorSummaryTitle: (count) => "\uBB38\uC81C\uAC00 " + n(count) + "\uAC1C \uC788\uC2B5\uB2C8\uB2E4",
  fieldOptional: "(\uC120\uD0DD)",
  dragFiles: "\uC5EC\uAE30\uB85C \uD30C\uC77C\uC744 \uB04C\uC5B4 \uC624\uC138\uC694",
  dragFile: "\uC5EC\uAE30\uB85C \uD30C\uC77C\uC744 \uB04C\uC5B4 \uC624\uC138\uC694",
  chooseFiles: "\uD30C\uC77C \uC120\uD0DD",
  chooseFile: "\uD30C\uC77C \uC120\uD0DD",
  chosenFiles: "\uC120\uD0DD\uD55C \uD30C\uC77C",
  chosenFile: "\uC120\uD0DD\uD55C \uD30C\uC77C",
  fileWrongType: (name, types) => types ? `${name}${ga(name)} ${new Intl.ListFormat("ko", { type: "disjunction" }).format(types.map((t) => KINDS[t] || t))} \uD615\uC2DD\uC774 \uC544\uB2D9\uB2C8\uB2E4.` : `${name}: \uC774 \uD615\uC2DD\uC758 \uD30C\uC77C\uC740 \uBC1B\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`,
  fileTooLarge: (name, limit) => `${name}${ga(name)} ${limit}\uBCF4\uB2E4 \uD07D\uB2C8\uB2E4.`,
  fileTooMany: (name, max) => `${name}${eul(name)} \uCD94\uAC00\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4: \uD30C\uC77C\uC740 \uCD5C\uB300 ${n(max)}\uAC1C\uC785\uB2C8\uB2E4.`,
  fileOnlyOne: (name) => `${name}${eul(name)} \uCD94\uAC00\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4: \uD30C\uC77C\uC740 \uD558\uB098\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.`,
  fileMissing: (multiple) => multiple ? "\uD30C\uC77C\uC744 \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD558\uC138\uC694." : "\uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.",
  fileFolder: (name) => `${name}${ga(name)} \uD3F4\uB354\uC785\uB2C8\uB2E4: \uC548\uC5D0 \uC788\uB294 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.`,
  fileAlreadyAdded: (name) => `${name}${ga(name)} \uC774\uBBF8 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`,
  filesAdded: (names) => names.length === 1 ? `${names[0]} \uCD94\uAC00\uB428.` : `\uD30C\uC77C ${n(names.length)}\uAC1C \uCD94\uAC00\uB428.`,
  fileRemoved: (name) => `${name} \uC0AD\uC81C\uB428.`,
  fileError: "\uC5C5\uB85C\uB4DC \uC2E4\uD328",
  viewImage: "\uC774\uBBF8\uC9C0 \uBCF4\uAE30",
  removeImage: "\uC774\uBBF8\uC9C0 \uC0AD\uC81C",
  edit: "\uD3B8\uC9D1",
  charactersLeft: (left) => left === 0 ? "\uAE00\uC790 \uC218 \uC81C\uD55C\uC5D0 \uB3C4\uB2EC\uD588\uC2B5\uB2C8\uB2E4." : n(left) + "\uC790 \uB0A8\uC558\uC2B5\uB2C8\uB2E4.",
  invalidValue: (p) => {
    switch (p.reason) {
      case "valueMissing":
        return "\uC774 \uD56D\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694.";
      case "typeMismatch":
        return p.type === "email" ? "\uC62C\uBC14\uB978 \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD558\uC138\uC694." : p.type === "url" ? "\uC62C\uBC14\uB978 URL\uC744 \uC785\uB825\uD558\uC138\uC694." : "\uC62C\uBC14\uB978 \uAC12\uC744 \uC785\uB825\uD558\uC138\uC694.";
      case "badInput":
        return "\uC22B\uC790\uB97C \uC785\uB825\uD558\uC138\uC694.";
      case "tooShort":
        return p.minLength + "\uC790 \uC774\uC0C1 \uC785\uB825\uD558\uC138\uC694(\uD604\uC7AC " + p.length + "\uC790).";
      case "tooLong":
        return p.maxLength + "\uC790 \uC774\uD558\uB85C \uC785\uB825\uD558\uC138\uC694(\uD604\uC7AC " + p.length + "\uC790).";
      case "rangeUnderflow":
        return "\uAC12\uC740 " + p.min + " \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.";
      case "rangeOverflow":
        return "\uAC12\uC740 " + p.max + " \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.";
      case "stepMismatch":
        return p.step + "\uC758 \uBC30\uC218\uB97C \uC785\uB825\uD558\uC138\uC694.";
      case "patternMismatch":
        return "\uC694\uCCAD\uD55C \uD615\uC2DD\uC5D0 \uB9DE\uAC8C \uC785\uB825\uD558\uC138\uC694." + (p.title ? " " + p.title : "");
      default:
        return "";
    }
  },
  keyName: (name) => KEYS[name] || name,
  keyboardShortcuts: "\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4",
  generalShortcuts: "\uC77C\uBC18",
  showShortcuts: "\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4 \uBCF4\uAE30",
  opensInNewTab: "(\uC0C8 \uD0ED\uC5D0\uC11C \uC5F4\uB9BC)",
  loadMore: "\uB354 \uBD88\uB7EC\uC624\uAE30",
  showingOf: (shown, total) => `${total}\uAC1C \uC911 ${shown}\uAC1C \uD45C\uC2DC`,
  loadedMore: (added) => `${added}\uAC1C \uB354 \uBD88\uB7EC\uC634`,
  moreLoaded: "\uB354 \uBD88\uB7EC\uC654\uC2B5\uB2C8\uB2E4",
  allLoaded: "\uB9C8\uC9C0\uB9C9\uC785\uB2C8\uB2E4",
  meterZone: (value, zone) => value + ", " + ZONES[zone],
  notificationCenter: "\uC54C\uB9BC",
  noNotifications: "\uC544\uC9C1 \uC54C\uB9BC\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
  unreadNotification: "\uC77D\uC9C0 \uC54A\uC74C",
  markRead: "\uC77D\uC74C\uC73C\uB85C \uD45C\uC2DC",
  markAllRead: "\uBAA8\uB450 \uC77D\uC74C\uC73C\uB85C \uD45C\uC2DC",
  clearNotifications: "\uBAA8\uB450 \uC9C0\uC6B0\uAE30",
  decrease: "\uC904\uC774\uAE30",
  increase: "\uB298\uB9AC\uAE30",
  pagination: "\uD398\uC774\uC9C0 \uD0D0\uC0C9",
  previousPage: "\uC774\uC804 \uD398\uC774\uC9C0",
  nextPage: "\uB2E4\uC74C \uD398\uC774\uC9C0",
  itemsOf: (first, last, total) => total + "\uAC1C \uC911 " + (first === last ? first : first + "\u2013" + last),
  perPage: "\uD398\uC774\uC9C0\uB2F9 \uD56D\uBAA9 \uC218",
  showPassword: "\uBE44\uBC00\uBC88\uD638 \uBCF4\uAE30",
  capsLockOn: "Caps Lock\uC774 \uCF1C\uC838 \uC788\uC2B5\uB2C8\uB2E4",
  country: "\uAD6D\uAC00",
  progressComplete: (name) => name ? name + ": \uC644\uB8CC" : "\uC644\uB8CC",
  ratingStars: (value) => "\uBCC4 " + n(value) + "\uAC1C",
  ratingValue: (value, max) => n(max) + "\uC810 \uC911 " + n(value) + "\uC810",
  saving: "\uC800\uC7A5 \uC911\u2026",
  saved: "\uC800\uC7A5\uB428",
  saveFailed: "\uC800\uC7A5\uD558\uC9C0 \uBABB\uD568",
  retrySave: "\uB2E4\uC2DC \uC2DC\uB3C4",
  searching: "\uAC80\uC0C9 \uC911",
  clearSearch: "\uAC80\uC0C9\uC5B4 \uC9C0\uC6B0\uAE30",
  sliderMinimum: "\uCD5C\uC19F\uAC12",
  sliderMaximum: "\uCD5C\uB313\uAC12",
  reorder: "\uC21C\uC11C \uBC14\uAFB8\uAE30",
  reorderInstructions: "\uC2A4\uD398\uC774\uC2A4\uB85C \uB4E4\uC5B4 \uC62C\uB9AC\uACE0, \uD654\uC0B4\uD45C \uD0A4\uB85C \uC62E\uAE30\uACE0, \uC2A4\uD398\uC774\uC2A4\uB97C \uB2E4\uC2DC \uB20C\uB7EC \uB0B4\uB824\uB193\uC73C\uC138\uC694. Esc\uB97C \uB204\uB974\uBA74 \uCDE8\uC18C\uB429\uB2C8\uB2E4.",
  reorderGrabbed: (item, p, total) => item + " \uB4E4\uC5B4 \uC62C\uB9BC, " + total + "\uAC1C \uC911 " + p + "\uBC88\uC9F8.",
  reorderMoved: (item, p, total) => item + ", " + total + "\uAC1C \uC911 " + p + "\uBC88\uC9F8.",
  reorderDropped: (item, p, total) => item + "\uC744(\uB97C) " + total + "\uAC1C \uC911 " + p + "\uBC88\uC9F8\uC5D0 \uB193\uC558\uC2B5\uB2C8\uB2E4.",
  reorderCancelled: (item, p, total) => "\uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4. " + item + "\uC740(\uB294) " + total + "\uAC1C \uC911 " + p + "\uBC88\uC9F8\uB85C \uB3CC\uC544\uAC14\uC2B5\uB2C8\uB2E4.",
  resizePanes: "\uCC3D \uD06C\uAE30 \uC870\uC808",
  splitterPlace: "\uD578\uB4E4\uC744 \uB458 \uACF3\uC744 \uB204\uB974\uAC70\uB098, \uD578\uB4E4\uC744 \uB2E4\uC2DC \uB20C\uB7EC \uCDE8\uC18C\uD558\uC138\uC694.",
  skipToContent: "\uBCF8\uBB38\uC73C\uB85C \uAC74\uB108\uB6F0\uAE30",
  offline: "\uC624\uD504\uB77C\uC778 \uC0C1\uD0DC\uC785\uB2C8\uB2E4",
  backOnline: "\uB2E4\uC2DC \uC628\uB77C\uC778 \uC0C1\uD0DC\uC785\uB2C8\uB2E4",
  completed: "\uC644\uB8CC",
  hasError: "\uC624\uB958 \uC788\uC74C",
  hasWarning: "\uD655\uC778 \uD544\uC694",
  stepOf: (step, total) => total + "\uB2E8\uACC4 \uC911 " + step + "\uB2E8\uACC4",
  tourBack: "\uC774\uC804",
  tourNext: "\uB2E4\uC74C",
  tourDone: "\uC644\uB8CC",
  sparklineSummary: (label, first, last, min, max) => label + ": " + first + "\uC5D0\uC11C " + last + "\uAE4C\uC9C0, \uCD5C\uC800 " + min + ", \uCD5C\uACE0 " + max,
  table: "\uD45C",
  tableSorted: (column, direction) => column + " \uAE30\uC900 " + (direction === "ascending" ? "\uC624\uB984\uCC28\uC21C" : "\uB0B4\uB9BC\uCC28\uC21C") + "\uC73C\uB85C \uC815\uB82C\uD588\uC2B5\uB2C8\uB2E4.",
  tableSelected: (count) => n(count) + "\uAC1C \uC120\uD0DD\uB428",
  clearSelection: "\uC120\uD0DD \uD574\uC81C",
  chooseTime: "\uC2DC\uAC04 \uC120\uD0DD",
  notifications: "\uC54C\uB9BC",
  toastShortcut: (key) => key + " \uD0A4\uB97C \uB204\uB974\uBA74 \uC774\uB3D9\uD569\uB2C8\uB2E4.",
  moreToasts: (count) => "\uC678 " + n(count) + "\uAC1C",
  toastRepeated: (count) => n(count) + "\uD68C",
  undo: "\uC2E4\uD589 \uCDE8\uC18C",
  typeToConfirm: "\uD655\uC778\uD558\uB824\uBA74 \uB2E4\uC74C\uC744 \uC785\uB825\uD558\uC138\uC694:",
  typePhraseFirst: (phrase) => "\uBA3C\uC800 \u2018" + phrase + "\u2019" + eul(phrase) + " \uC785\uB825\uD558\uC138\uC694",
  close: "\uB2EB\uAE30",
  dismiss: "\uB2EB\uAE30",
  loading: "\uBD88\uB7EC\uC624\uB294 \uC911\u2026",
  copy: "\uBCF5\uC0AC",
  codeCopy: "\uCF54\uB4DC \uBCF5\uC0AC",
  codeName: "\uCF54\uB4DC",
  remove: "\uC0AD\uC81C",
  image: "\uC774\uBBF8\uC9C0",
  page: (p) => p + "\uD398\uC774\uC9C0",
  progress: "\uC9C4\uD589\uB960",
  optional: "\uC120\uD0DD",
  mainNavigation: "\uC8FC \uBA54\uB274",
  menu: "\uBA54\uB274",
  required: "\uD544\uC218"
};
export {
  labels,
  locale
};
//# sourceMappingURL=ko.js.map
