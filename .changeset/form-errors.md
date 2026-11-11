---
"serupa-ds": minor
---

Field has `FormErrors`, for the errors a server sends back by field name: each Field inside shows its own message on its control (invalid, and in its description) and drops it as soon as the field is edited, and an ErrorSummary inside with no `errors` lists them, links to each field and takes focus for each new set. Field also takes a `name`, for when its control's name isn't the one in the errors.
