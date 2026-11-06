import { Icon, IconButton, Stack } from 'serupa-ds';

type DocumentActionsProps = {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function DocumentActions({ onEdit, onDuplicate, onDelete }: DocumentActionsProps) {
  return (
    <Stack direction="row" gap={2} role="group" aria-label="Document actions">
      <IconButton label="Edit document" onClick={onEdit}>
        <Icon name="edit" />
      </IconButton>
      <IconButton label="Duplicate document" onClick={onDuplicate}>
        <Icon name="content_copy" />
      </IconButton>
      <IconButton label="Delete document" onClick={onDelete}>
        <Icon name="delete" />
      </IconButton>
    </Stack>
  );
}
