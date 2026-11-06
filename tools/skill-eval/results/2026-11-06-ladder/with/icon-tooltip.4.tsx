import { IconButton, Stack } from 'serupa-ds';

type DocumentActionsProps = {
  documentName: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function DocumentActions({
  documentName,
  onEdit,
  onDuplicate,
  onDelete,
}: DocumentActionsProps) {
  return (
    <Stack direction="row" gap={1} role="group" aria-label={`Actions for ${documentName}`}>
      <IconButton icon="edit" label={`Edit ${documentName}`} onClick={onEdit} />
      <IconButton icon="content_copy" label={`Duplicate ${documentName}`} onClick={onDuplicate} />
      <IconButton icon="delete" label={`Delete ${documentName}`} onClick={onDelete} />
    </Stack>
  );
}
