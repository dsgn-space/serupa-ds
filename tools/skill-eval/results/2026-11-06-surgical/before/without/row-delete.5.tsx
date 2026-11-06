import * as React from 'react';
import { Button, Menu, MenuItem, Table } from 'serupa-ds';

type Doc = { id: string; title: string; updated: string };

export function DocumentTable({ docs, onEdit, onDuplicate, onDelete }: {
  docs: Doc[];
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Updated</th>
          <th><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {docs.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.title}</td>
            <td>{doc.updated}</td>
            <td>
              <Menu trigger={<Button variant="ghost" size="sm" rightIcon="expand_more">Actions</Button>}>
                <MenuItem icon="edit" onSelect={() => onEdit(doc.id)}>Edit</MenuItem>
                <MenuItem icon="content_copy" onSelect={() => onDuplicate(doc.id)}>Duplicate</MenuItem>
                <MenuItem icon="delete" onSelect={() => onDelete(doc.id)}>Delete</MenuItem>
              </Menu>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
