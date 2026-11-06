import { useState } from 'react';
import {
  Button,
  Container,
  EmptyState,
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
  role: 'Owner' | 'Admin' | 'Member';
};

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Siti Rahma', email: 'siti@example.com', role: 'Owner' },
  { id: '2', name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin' },
  { id: '3', name: 'Ayu Lestari', email: 'ayu@example.com', role: 'Member' },
];

type TeamSettingsProps = {
  members?: Member[];
  onInvite?: () => void;
  onRemove?: (member: Member) => void;
};

export function TeamSettings({
  members: initialMembers = INITIAL_MEMBERS,
  onInvite,
  onRemove,
}: TeamSettingsProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const handleRemove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    onRemove?.(member);
    toast(`${member.name} removed from the team`);
  };

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Heading level={1}>Team settings</Heading>

        <Stack gap={4}>
          <Stack direction="row" className="justify-end">
            <Button onClick={onInvite}>Invite</Button>
          </Stack>

          {members.length === 0 ? (
            <EmptyState
              title="No members yet"
              description="Invite people to collaborate on this team."
              action={<Button onClick={onInvite}>Invite</Button>}
            />
          ) : (
            <Table>
              <VisuallyHidden as="caption">Team members</VisuallyHidden>
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
                        onClick={() => handleRemove(member)}
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

      <Toaster />
    </Container>
  );
}
