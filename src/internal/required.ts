import * as React from 'react';

/* required on a control with no native field to hold it (a popup's button, a drawing): a hidden-from-view input
   carries required, so the form isn't sent without a value. The browser's bubble gives way to the control's own
   marking: it reads as invalid (missing) until filled, and takes focus when it's the form's first invalid field, as
   the browser would do. ColorPicker does the same by hand. */
export function useRequired(filled: boolean, focus: () => void): { missing: boolean; onInvalid: (e: React.FormEvent<HTMLInputElement>) => void } {
  const [missing, setMissing] = React.useState(false);
  if (missing && filled) setMissing(false);
  const onInvalid = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMissing(true);
    const form = e.currentTarget.form;
    const first = form ? Array.from(form.elements).find((x) => (x as HTMLInputElement).willValidate && !(x as HTMLInputElement).validity.valid) : e.currentTarget;
    if (first === e.currentTarget) focus();
  };
  return { missing: missing && !filled, onInvalid };
}
