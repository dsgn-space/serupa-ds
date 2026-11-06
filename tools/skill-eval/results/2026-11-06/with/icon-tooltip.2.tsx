import { IconButton, Tooltip, ButtonGroup } from 'serupa-ds';

export function DocumentActions() {
  return (
    <ButtonGroup aria-label="Document actions" gap>
      <Tooltip content="Edit">
        <IconButton icon="edit" label="Edit" />
      </Tooltip>
      <Tooltip content="Duplicate">
        <IconButton icon="content_copy" label="Duplicate" />
      </Tooltip>
      <Tooltip content="Delete">
        <IconButton icon="delete" label="Delete" />
      </Tooltip>
    </ButtonGroup>
  );
}
