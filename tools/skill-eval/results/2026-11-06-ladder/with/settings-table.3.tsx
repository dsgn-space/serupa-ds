import { useState } from 'react';
import {
  Button,
  Container,
  Heading,
  IconButton,
  Stack,
  Table,
  Text,
  Toaster,
  VisuallyHidden,
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

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  const remove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast(`${member.name} removed from the team`);
  };

  return (
    <>
      <VisuallyHidden focusable as="a" href="#main">
        Skip to content
      </VisuallyHidden>

      <Container as="main" id="main" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Team settings</Heading>

          <Stack gap={3}>
            <Stack direction="row" justify="between" align="center">
              <Heading level={2} size="lg">
                Members
              </Heading>
              <Button onClick={() => toast('Invite sent')}>Invite</Button>
            </Stack>

            {members.length === 0 ? (
              <Text className="text-text-muted">
                No members yet. Use Invite to add someone to the team.
              </Text>
            ) : (
              <Table>
                <caption className="sr-only">Team members</caption>
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
                          icon="delete"
                          label={`Remove ${member.name}`}
                          size="sm"
                          onClick={() => remove(member)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Stack>
        </Stack>
      </Container>

      <Toaster />
    </>
  );
}
