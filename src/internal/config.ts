import type * as React from "react";

export interface DikiConfig {
  /** Renders a Button with href, such as a router's Link (Next.js: Link; React Router: a component that maps href to to). Receives href, className, ref, event handlers and children. Default: 'a'. */
  link?: React.ElementType;
}

// What renders a Button (or Badge) with href; configure({ link }) changes it.
export const config: Required<DikiConfig> = { link: "a" };

/** Set once at startup; returns the current settings. */
export function configure(opts?: DikiConfig): Required<DikiConfig> {
  opts = opts || {};
  if (opts.link) config.link = opts.link;
  return Object.assign({}, config);
}
