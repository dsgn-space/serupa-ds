// NOTE: I couldn't inspect serupa-ds in this session, so the import names
// and props below (Button, Heading, Table*) are assumed. Check them against
// the library's exports before using this.
import { useState } from "react";
import {
  Button,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "serupa-ds";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Ayu Lestari", email: "ayu@example.com", role: "Owner" },
  { id: "2", name: "Budi Santoso", email: "budi@example.com", role: "Admin" },
  { id: "3", name: "Citra Dewi", email: "citra@example.com", role: "Member" },
];

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  const handleInvite = () => {
    // Open your invite dialog / flow here.
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <main>
      <Heading level={1}>Team settings</Heading>

      <div style={{ display: "flex", justifyContent: "flex-end", margin: "16px 0" }}>
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
