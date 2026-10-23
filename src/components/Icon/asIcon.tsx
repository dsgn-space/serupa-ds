import * as React from "react";
import { isIconData } from "../../icons";
import type { IconData } from "../../material/types";
import { Icon } from "./Icon";

// In its own module, without "use client", so components that render on the server (EmptyState, Input) can call it:
// a function from a client module is only a reference there.
/** An icon name or an icon from serupa-ds/icons becomes an <Icon>; elements pass through. */
export function asIcon(node: React.ReactNode | IconData): React.ReactNode {
  if (typeof node === "string") return <Icon name={node} />;
  if (isIconData(node)) return <Icon icon={node} />;
  return node as React.ReactNode;
}
