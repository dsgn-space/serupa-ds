import { useState } from "react";
// Assumed export names: I couldn't inspect serupa-ds here, so check these against its docs.
import {
  Button,
  Heading,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "serupa-ds";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const initialMembers: Member[] = [
  { id: "1", name: "Ayu Lestari", email: "ayu@example.com", role: "Owner" },
  { id: "2", name: "Budi Santoso", email: "budi@example.com", role: "Admin" },
  { id: "3", name: "Citra Dewi", email: "citra@example.com", role: "Member" },
];

export default function TeamSettings() {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const handleInvite = () => {
    // Open your invite flow here (dialog, route, etc.)
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <main>
      <Heading level={1}>Team settings</Heading>

      <div style={{ margin: "16px 0" }}>
        <Button onClick={handleInvite}>Invite</Button>
      </div>

      <Table aria-label="Team members">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Role</TableHeader>
            <TableHeader>
              <span className="sr-only">Actions</span>
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>
                <Button
                  variant="danger"
                  onClick={() => handleRemove(member.id)}
                  aria-label={`Remove ${member.name}`}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
