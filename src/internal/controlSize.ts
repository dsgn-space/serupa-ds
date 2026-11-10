import * as React from 'react';

/** The size a group (ButtonGroup) gives the buttons in it that don't set their own: one size on the group, rather
    than the same size on every button. A button's own size wins. */
export const ControlSize = /* @__PURE__ */ React.createContext<'sm' | 'md' | 'lg' | undefined>(undefined);
