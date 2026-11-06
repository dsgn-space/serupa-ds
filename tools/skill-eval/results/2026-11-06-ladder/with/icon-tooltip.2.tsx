import { ButtonGroup, IconButton } from 'serupa-ds';

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
    <ButtonGroup aria-label={`Actions for ${documentName}`}>
      {/* IconButton's `label` is both its accessible name and its tooltip. */}
      <IconButton icon="edit" label="Edit" onClick={onEdit} />
      <IconButton icon="content_copy" label="Duplicate" onClick={onDuplicate} />
      <IconButton icon="delete" label="Delete" onClick={onDelete} />
    </ButtonGroup>
  );
}
