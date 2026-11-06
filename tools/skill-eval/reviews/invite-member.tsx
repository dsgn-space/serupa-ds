import * as React from 'react';
import { Button, Field, IconButton, Input, Stack, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, toast } from 'serupa-ds';

type Member = { id: string; name: string; email: string; active: boolean };

export function TeamMembers({ members, onInvite, onRemove }: {
  members: Member[];
  onInvite: (email: string) => Promise<void>;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');

  async function invite() {
    try {
      await onInvite(email);
      setOpen(false);
      toast('Invite sent');
    } catch {
      toast('Something went wrong!');
    }
  }

  return (
    <Stack gap={4}>
      <Button onClick={() => setOpen(true)}>Invite Member</Button>
      <Table caption="Team members">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: m.active ? '#16a34a' : '#dc2626' }} /></TableCell>
              <TableCell><IconButton icon="delete" onClick={() => onRemove(m.id)} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {open && (
        <div className="fixed inset-0 bg-surface p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <h2>Invite</h2>
            <Field label="Email">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button onClick={invite}>OK</Button>
          </div>
        </div>
      )}
    </Stack>
  );
}
