// src/components/Stepper/labels.ts
var en = {
  completed: "completed",
  hasError: "has an error",
  hasWarning: "needs attention",
  stepOf: (step, total, stepText = String(step), totalText = String(total)) => "Step " + stepText + " of " + totalText
};
var id = {
  completed: "selesai",
  hasError: "ada kesalahan",
  hasWarning: "perlu diperhatikan",
  stepOf: (step, total, stepText = String(step), totalText = String(total)) => "Langkah " + stepText + " dari " + totalText
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
