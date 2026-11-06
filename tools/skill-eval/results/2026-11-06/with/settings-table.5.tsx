import { useState } from 'react';
import {
  Button,
  Container,
  Heading,
  Icon,
  IconButton,
  Stack,
  Table,
  Toaster,
  VisuallyHidden,
  toast,
} from 'serupa-ds';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
};

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Siti Rahma', email: 'siti@example.com', role: 'Owner' },
  { id: '2', name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin' },
  { id: '3', name: 'Ayu Lestari', email: 'ayu@example.com', role: 'Member' },
  { id: '4', name: 'Dewi Kusuma', email: 'dewi@example.com', role: 'Viewer' },
];

export function TeamSettings({ onInvite }: { onInvite?: () => void }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  const remove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast(`${member.name} removed from the team`);
  };

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Heading level={1}>Team settings</Heading>

        <Stack direction="row" justify="end">
          <Button onClick={onInvite}>
            <Icon name="person_add" aria-hidden="true" />
            Invite
          </Button>
        </Stack>

        <Table>
          <caption>
            <VisuallyHidden>Team members</VisuallyHidden>
          </caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">
                <VisuallyHidden>Actions</VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <th scope="row">{member.name}</th>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>
                  <IconButton
                    label={`Remove ${member.name}`}
                    onClick={() => remove(member)}
                  >
                    <Icon name="delete" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>

      <Toaster />
    </Container>
  );
}
