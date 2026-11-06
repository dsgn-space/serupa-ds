import { useState } from 'react';
import { Badge, Button, Heading, Stack, Table, Text, VisuallyHidden, announce, toast } from 'serupa-ds';

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
  { id: '4', name: 'Dimas Prakoso', email: 'dimas@example.com', role: 'Viewer' },
];

type TeamSettingsProps = {
  initialMembers?: Member[];
  onInvite?: () => void;
  onRemove?: (member: Member) => void;
};

export function TeamSettings({
  initialMembers = INITIAL_MEMBERS,
  onInvite,
  onRemove,
}: TeamSettingsProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const handleRemove = (member: Member) => {
    setMembers((current) => current.filter((m) => m.id !== member.id));
    onRemove?.(member);
    toast(`${member.name} removed from the team`);
    announce(`${member.name} removed from the team`);
  };

  return (
    <Stack gap={6}>
      <Heading level={1}>Team settings</Heading>

      <Stack gap={4}>
        <div className="flex items-center justify-between gap-4">
          <Heading level={2}>Members</Heading>
          <Button onClick={onInvite}>Invite</Button>
        </div>

        {members.length === 0 ? (
          <Text className="text-text-muted">
            No members yet. Use Invite to add your first teammate.
          </Text>
        ) : (
          <Table>
            <caption className="dk-visually-hidden">Team members</caption>
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
                  <td>
                    <Badge>{member.role}</Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      disabled={member.role === 'Owner'}
                      onClick={() => handleRemove(member)}
                    >
                      Remove
                      <VisuallyHidden> {member.name}</VisuallyHidden>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Stack>
    </Stack>
  );
}

export default TeamSettings;
