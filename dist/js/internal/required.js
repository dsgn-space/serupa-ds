// src/internal/required.ts
import * as React from "react";
function useRequired(filled, focus) {
  const [missing, setMissing] = React.useState(false);
  if (missing && filled) setMissing(false);
  const onInvalid = (e) => {
    e.preventDefault();
    setMissing(true);
    const form = e.currentTarget.form;
    const first = form ? Array.from(form.elements).find((x) => x.willValidate && !x.validity.valid) : e.currentTarget;
    if (first === e.currentTarget) focus();
  };
  return { missing: missing && !filled, onInvalid };
}
export {
  useRequired
};
//# sourceMappingURL=required.js.map
