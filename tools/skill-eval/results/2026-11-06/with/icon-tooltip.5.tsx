import { ButtonGroup, IconButton, Tooltip } from 'serupa-ds';

type DocumentActionsProps = {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function DocumentActions({ onEdit, onDuplicate, onDelete }: DocumentActionsProps) {
  return (
    <ButtonGroup>
      <Tooltip content="Edit document">
        <IconButton icon="edit" label="Edit document" onClick={onEdit} />
      </Tooltip>
      <Tooltip content="Duplicate document">
        <IconButton icon="content_copy" label="Duplicate document" onClick={onDuplicate} />
      </Tooltip>
      <Tooltip content="Delete document">
        <IconButton icon="delete" label="Delete document" onClick={onDelete} />
      </Tooltip>
    </ButtonGroup>
  );
}
