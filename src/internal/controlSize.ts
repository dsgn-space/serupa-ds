import * as React from 'react';

/** The size a group (ButtonGroup) gives the buttons in it that don't set their own: one size on the group, rather
    than the same size on every button. A button's own size wins. */
export const ControlSize = /* @__PURE__ */ React.createContext<'sm' | 'md' | 'lg' | undefined>(undefined);

/** A control's size: its own, else the one a group or a SerupaProvider around it gives (size="sm" on a form's
    SerupaProvider makes every field in it small), else undefined for the control's default. */
export function useControlSize<S extends string>(own: S | undefined): S | 'sm' | 'md' | 'lg' | undefined {
  const around = React.useContext(ControlSize);
  return own ?? around;
}
