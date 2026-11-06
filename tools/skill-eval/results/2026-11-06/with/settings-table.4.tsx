import { useState } from 'react';
import {
  Badge,
  Button,
  Container,
  Heading,
  Icon,
  IconButton,
  Stack,
  Table,
  Toaster,
  toast,
} from 'serupa-ds';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
};

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Siti Rahma', email: 'siti@example.com', role: 'Owner' },
  { id: '2', name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin' },
  { id: '3', name: 'Ayu Lestari', email: 'ayu@example.com', role: 'Member' },
];

export function TeamSettings({ onInvite }: { onInvite?: () => void }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  const remove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast(`${member.name} removed`);
  };

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Heading level={1}>Team settings</Heading>

        <Stack direction="row" justify="end">
          <Button onClick={onInvite}>
            <Icon name="person_add" />
            Invite
          </Button>
        </Stack>

        <Table>
          <caption className="dk-visually-hidden">Team members</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">
                <span className="dk-visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <th scope="row">{member.name}</th>
                <td>{member.email}</td>
                <td>
                  <Badge>{member.role}</Badge>
                </td>
                <td>
                  <IconButton
                    label={`Remove ${member.name}`}
                    size="sm"
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
