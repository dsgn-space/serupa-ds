import * as React from "react";

/** The children as a flat list, with Fragments opened up (at any depth) and null, false and undefined dropped.
 *  Keys stay unique: an item inside a Fragment gets the Fragment's key in front of its own. Components that count,
 *  number or wrap their children use it, so `{admin && <><Item /><Item /></>}` gives two items, not one. */
export function flattenChildren(children: React.ReactNode, prefix = ""): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (const c of React.Children.toArray(children)) {
    if (React.isValidElement(c) && c.type === React.Fragment) out.push(...flattenChildren((c.props as { children?: React.ReactNode }).children, prefix + String(c.key)));
    else if (prefix && React.isValidElement(c)) out.push(React.cloneElement(c, { key: prefix + String(c.key) }));
    else out.push(c);
  }
  return out;
}
