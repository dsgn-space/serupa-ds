import { ButtonGroup, IconButton, Tooltip, toast } from 'serupa-ds';

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
      <IconButton
        icon="edit"
        label={`Edit ${documentName}`}
        onClick={onEdit}
      />
      <IconButton
        icon="content_copy"
        label={`Duplicate ${documentName}`}
        onClick={() => {
          onDuplicate();
          toast('Document duplicated');
        }}
      />
      <IconButton
        icon="delete"
        label={`Delete ${documentName}`}
        onClick={onDelete}
      />
    </ButtonGroup>
  );
}
