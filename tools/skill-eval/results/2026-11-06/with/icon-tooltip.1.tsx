import { ButtonGroup, IconButton, Tooltip, toast } from 'serupa-ds';

type DocumentActionsProps = {
  documentName: string;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
};

export function DocumentActions({
  documentName,
  onEdit,
  onDuplicate,
  onDelete,
}: DocumentActionsProps) {
  return (
    <ButtonGroup aria-label={`Actions for ${documentName}`} gap="2">
      <Tooltip content="Edit">
        <IconButton
          icon="edit"
          label="Edit"
          onClick={() => onEdit?.()}
        />
      </Tooltip>
      <Tooltip content="Duplicate">
        <IconButton
          icon="content_copy"
          label="Duplicate"
          onClick={() => {
            onDuplicate?.();
            toast('Document duplicated');
          }}
        />
      </Tooltip>
      <Tooltip content="Delete">
        <IconButton
          icon="delete"
          label="Delete"
          onClick={() => onDelete?.()}
        />
      </Tooltip>
    </ButtonGroup>
  );
}
