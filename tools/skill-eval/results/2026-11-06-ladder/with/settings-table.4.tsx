import { useState } from 'react';
import {
  Badge,
  Button,
  Container,
  Heading,
  Icon,
  IconButton,
  SkipLink,
  Stack,
  Table,
  Toaster,
  announce,
  toast,
} from 'serupa-ds';

type Member = { id: string; name: string; email: string; role: string };

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Amara Okafor', email: 'amara@example.com', role: 'Owner' },
  { id: '2', name: 'Luis Herrera', email: 'luis@example.com', role: 'Admin' },
  { id: '3', name: 'Mei Tanaka', email: 'mei@example.com', role: 'Editor' },
  { id: '4', name: 'Sara Lindqvist', email: 'sara@example.com', role: 'Viewer' },
];

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  const handleInvite = () => {
    // Replace with your invite flow (e.g. open a Dialog containing a Field + Input).
    toast('Invite flow not connected yet');
  };

  const handleRemove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast(`${member.name} removed from the team`);
    announce(`${member.name} removed from the team`);
  };

  return (
    <>
      <SkipLink href="#main">Skip to content</SkipLink>

      <Container as="main" id="main">
        <Stack gap={6} className="py-8">
          <Stack direction="row" justify="between" align="center" gap={4}>
            <Heading level={1}>Team settings</Heading>
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
                  <td>
                    <Badge>{member.role}</Badge>
                  </td>
                  <td>
                    <IconButton
                      label={`Remove ${member.name}`}
                      size="sm"
                      onClick={() => handleRemove(member)}
                    >
                      <Icon name="delete" />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-text-muted">
                    No members yet. Use Invite to add someone to the team.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Stack>
      </Container>

      <Toaster />
    </>
  );
}
