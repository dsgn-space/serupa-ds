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
  toast,
  announce,
} from 'serupa-ds';

type Member = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
};

const initialMembers: Member[] = [
  { id: '1', name: 'Siti Rahma', email: 'siti@example.com', role: 'Owner' },
  { id: '2', name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin' },
  { id: '3', name: 'Ayu Lestari', email: 'ayu@example.com', role: 'Member' },
];

export function TeamSettings() {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const handleInvite = () => {
    // Open your invite dialog here.
  };

  const handleRemove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast(`${member.name} removed`);
    announce(`${member.name} removed from the team`);
  };

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Heading level={1}>Team settings</Heading>

        <Stack direction="row" className="justify-between items-center">
          <Heading level={2}>Members</Heading>
          <Button onClick={handleInvite}>
            <Icon name="person_add" />
            Invite
          </Button>
        </Stack>

        <Table>
          <caption className="sr-only">Team members</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
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
                    icon="delete"
                    size="sm"
                    onClick={() => handleRemove(member)}
                  />
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
