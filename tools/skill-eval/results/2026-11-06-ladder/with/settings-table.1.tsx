import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Container,
  Heading,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Toaster,
  VisuallyHidden,
  toast,
} from 'serupa-ds';

type Role = 'Owner' | 'Admin' | 'Member';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Ayu Lestari', email: 'ayu@example.com', role: 'Owner' },
  { id: '2', name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin' },
  { id: '3', name: 'Citra Dewi', email: 'citra@example.com', role: 'Member' },
];

export interface TeamSettingsPageProps {
  onInvite?: () => void;
}

export function TeamSettingsPage({ onInvite }: TeamSettingsPageProps) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  useEffect(() => {
    document.title = 'Team settings';
  }, []);

  const remove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    toast(`${member.name} removed from the team`);
  };

  return (
    <Container as="main" id="main">
      <Stack gap={6} className="py-8">
        <Heading level={1}>Team settings</Heading>

        <Stack gap={4}>
          <Stack direction="row" justify="between" align="center">
            <Heading level={2} size="lg">
              Members
            </Heading>
            <Button onClick={onInvite}>Invite</Button>
          </Stack>

          {members.length === 0 ? (
            <Text className="text-text-muted">
              No members yet. Use Invite to add the first person.
            </Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge>{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(member)}
                      >
                        Remove
                        <VisuallyHidden> {member.name}</VisuallyHidden>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Stack>
      <Toaster />
    </Container>
  );
}
