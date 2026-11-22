// Moving with the arrow keys, shared by the composite widgets.

/** Whether Alt, Ctrl or Meta is held: then an arrow key is the browser's or the system's (Alt+Left is Back), and a
    widget that moves on arrows leaves it alone. Shift is left out, since lists extend a selection with it. */
export const modified = (e: { altKey: boolean; ctrlKey: boolean; metaKey: boolean }): boolean => e.altKey || e.ctrlKey || e.metaKey;
