---
"serupa-ds": minor
---

Stepper and Tour: the step count ("Step 2 of 4") is in the locale's digits. The `stepOf` label gets the two numbers formatted for the locale as third and fourth arguments, `(step, total, stepText, totalText)`, and the built-in labels and every language pack use them, so it reads "Step ٢ of ٤" in ar-EG. Labels that take only the numbers keep working. Stepper's `labels.stepOf` takes the same arguments.
