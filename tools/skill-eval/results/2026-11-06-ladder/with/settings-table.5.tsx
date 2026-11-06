import { useState } from 'react';
import {
  Button,
  Container,
  Heading,
  Icon,
  IconButton,
  Stack,
  Table,
  Text,
  Toaster,
  VisuallyHidden,
  toast,
} from 'serupa-ds';

type Member = { id: string; name: string; email: string; role: string };

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Alya Putri', email: 'alya@example.com', role: 'Owner' },
  { id: '2', name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin' },
  { id: '3', name: 'Citra Dewi', email: 'citra@example.com', role: 'Member' },
];

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  const removeMember = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast(`${member.name} removed`);
  };

  return (
    <>
      <VisuallyHidden focusable>
        <a href="#main">Skip to content</a>
      </VisuallyHidden>

      <Container as="main" id="main" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Team settings</Heading>

          <Stack gap={3}>
            <Stack direction="row" gap={2} className="justify-between items-center">
              <Heading level={2} size="md">
                Members
              </Heading>
              <Button onClick={() => toast('Invite dialog is not wired up yet')}>
                Invite
              </Button>
            </Stack>

            {members.length === 0 ? (
              <Text className="text-text-muted">
                No members yet. Use Invite to add someone to your team.
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
                          label={`Remove ${member.name}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member)}
                        >
                          <Icon name="delete" />
                        </IconButton>
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
