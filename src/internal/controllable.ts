import * as React from 'react';
import { warnOnce } from './warn';

/** A value the app may own (controlled: it passes `value`) or leave to the component (uncontrolled: it passes
 *  `initial`, or nothing). Returns the value to show, the setter for the component's own copy (which only counts while
 *  uncontrolled), and whether it's controlled. A prop that switches between the two (`value={state.tab}` with
 *  `state.tab` undefined for one render) warns once in development: the component would quietly show its own,
 *  old state, and the screen would disagree with the app's. */
export function useControllable<T>(value: T | undefined, initial: T, component: string, prop: string): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [own, setOwn] = React.useState<T>(initial);
  const controlled = value !== undefined;
  useControlledSwitch(controlled, component, prop);
  return [controlled ? value : own, setOwn, controlled];
}

/** The development warning on its own, for a component that keeps its own state in another shape (DateField keeps the
 *  three boxes' text, not the date). */
export function useControlledSwitch(controlled: boolean, component: string, prop: string) {
  const was = React.useRef(controlled);
  // [controlled]: runs when the answer changes, after the render that changed it.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && was.current !== controlled) {
      warnOnce('controlled-switch', `${component}: \`${prop}\` changed from ${was.current ? 'controlled to uncontrolled' : 'uncontrolled to controlled'} (it ${controlled ? 'was undefined and now has a value' : 'had a value and is now undefined'}). Keep it one or the other for the component's lifetime: pass a real value (false, an empty list) rather than undefined while the app's state loads or resets, or pass default${prop[0]!.toUpperCase() + prop.slice(1)} for the component to keep its own.`, 'controlled-switch:' + component + ':' + prop);
    }
    was.current = controlled;
  }, [controlled, component, prop]);
}
