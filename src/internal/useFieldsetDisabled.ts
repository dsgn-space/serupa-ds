import * as React from "react";
import { useIsoLayoutEffect } from "./cn";

/** Whether the element sits in a disabled <fieldset> (outside its first <legend>, as HTML has it). Native controls
 *  follow that on their own; a control drawn from spans and divs (Slider's thumbs) reads it here and then acts
 *  disabled too. It follows the fieldset's disabled attribute as it changes. */
export function useFieldsetDisabled(ref: React.RefObject<HTMLElement | null>): boolean {
  const [off, setOff] = React.useState(false);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const f = el.closest("fieldset:disabled");
      const legend = f && f.querySelector(":scope > legend");
      setOff(!!f && !(legend && legend.contains(el)));
    };
    check();
    const fieldsets: Element[] = [];
    for (let f = el.closest("fieldset"); f; f = f.parentElement && f.parentElement.closest("fieldset")) fieldsets.push(f);
    if (!fieldsets.length || typeof MutationObserver === "undefined") return;
    const mo = new MutationObserver(check);
    for (const f of fieldsets) mo.observe(f, { attributes: true, attributeFilter: ["disabled"] });
    return () => mo.disconnect();
  }, [ref]);
  return off;
}
