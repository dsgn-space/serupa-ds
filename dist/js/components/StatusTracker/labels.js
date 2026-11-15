// src/components/StatusTracker/labels.ts
var en = {
  statusUp: "Up",
  statusDegraded: "Degraded",
  statusDown: "Down",
  statusNone: "No data",
  statusSummary: (percent, days, incidents) => percent + " up over " + (days === 1 ? "1 day" : days + " days") + ", " + (incidents === 0 ? "no incidents" : incidents === 1 ? "1 incident" : incidents + " incidents"),
  statusDay: (date, state) => date + ": " + state
};
var id = {
  statusUp: "Aktif",
  statusDegraded: "Terganggu",
  statusDown: "Mati",
  statusNone: "Tidak ada data",
  statusSummary: (percent, days, incidents) => percent + " aktif selama " + days + " hari, " + (incidents === 0 ? "tanpa insiden" : incidents + " insiden"),
  statusDay: (date, state) => date + ": " + state
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
