import type { ReactNode } from "react";
import { Button, Tooltip } from "serupa-ds";

// NOTE: I couldn't inspect serupa-ds in this session, so the Button and Tooltip
// props below are assumed. Check them against the library's docs.

type DocumentActionsProps = {
  documentName: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const svgProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const EditIcon = () => (
  <svg {...svgProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const DuplicateIcon = () => (
  <svg {...svgProps}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const DeleteIcon = () => (
  <svg {...svgProps}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

type Action = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
};

export function DocumentActions({
  documentName,
  onEdit,
  onDuplicate,
  onDelete,
}: DocumentActionsProps) {
  const actions: Action[] = [
    { key: "edit", label: "Edit", icon: <EditIcon />, onClick: onEdit },
    { key: "duplicate", label: "Duplicate", icon: <DuplicateIcon />, onClick: onDuplicate },
    { key: "delete", label: "Delete", icon: <DeleteIcon />, onClick: onDelete, destructive: true },
  ];

  return (
    <div
      role="group"
      aria-label={`Actions for ${documentName}`}
      style={{ display: "inline-flex", gap: 4 }}
    >
      {actions.map(({ key, label, icon, onClick, destructive }) => (
        <Tooltip key={key} content={label}>
          <Button
            type="button"
            variant={destructive ? "danger" : "ghost"}
            size="sm"
            aria-label={`${label} ${documentName}`}
            onClick={onClick}
          >
            {icon}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
