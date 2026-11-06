import { ButtonGroup, Icon, IconButton } from 'serupa-ds';

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
      <IconButton label="Edit" onClick={onEdit}>
        <Icon name="edit" />
      </IconButton>
      <IconButton label="Duplicate" onClick={onDuplicate}>
        <Icon name="content_copy" />
      </IconButton>
      <IconButton label="Delete" onClick={onDelete}>
        <Icon name="delete" />
      </IconButton>
    </ButtonGroup>
  );
}
