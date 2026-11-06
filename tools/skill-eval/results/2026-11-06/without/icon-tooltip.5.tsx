import { Button, Tooltip } from "serupa-ds";

type DocumentActionsProps = {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

// NOTE: I couldn't inspect the installed serupa-ds package, so the exports
// (`Button`, `Tooltip`) and their props (`content`, `variant`, `aria-label`)
// are assumed. Adjust them to match the real API.
export function DocumentActions({ onEdit, onDuplicate, onDelete }: DocumentActionsProps) {
  const actions = [
    { label: "Edit document", icon: "✎", onClick: onEdit },
    { label: "Duplicate document", icon: "⧉", onClick: onDuplicate },
    { label: "Delete document", icon: "🗑", onClick: onDelete },
  ];

  return (
    <div role="group" aria-label="Document actions" style={{ display: "flex", gap: 8 }}>
      {actions.map(({ label, icon, onClick }) => (
        <Tooltip key={label} content={label}>
          <Button type="button" variant="ghost" aria-label={label} onClick={onClick}>
            <span aria-hidden="true">{icon}</span>
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
