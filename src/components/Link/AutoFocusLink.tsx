'use client';
import * as React from 'react';
import { useMergedRef } from '../../internal/cn';
import { useAutoFocus } from '../../internal/focus';

/* The element Link renders when it has autoFocus. React only autofocuses form controls, so this focuses the link
   once it's mounted. It's a client module of its own, so Link stays a Server Component without autoFocus. */
export function AutoFocusLink(props: { as: React.ElementType; linkRef: React.ForwardedRef<HTMLAnchorElement>; attrs: Record<string, unknown>; children?: React.ReactNode }) {
  const node = React.useRef<HTMLAnchorElement | null>(null);
  const linkRefs = useMergedRef(props.linkRef, (n) => { node.current = n; });
  useAutoFocus(true, () => node.current);
  return React.createElement(props.as, { ...props.attrs, ref: linkRefs }, props.children);
}
