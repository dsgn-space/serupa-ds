// NOTE: I couldn't inspect the installed serupa-ds package (no file access in this
// session), so the component names and props imported below are assumptions.
// Check them against the package's exports before using this.
import { useState } from "react";
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "serupa-ds";

type Role = "Owner" | "Admin" | "Member";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const initialMembers: Member[] = [
  { id: "1", name: "Aisyah Rahman", email: "aisyah@example.com", role: "Owner" },
  { id: "2", name: "Budi Santoso", email: "budi@example.com", role: "Admin" },
  { id: "3", name: "Citra Dewi", email: "citra@example.com", role: "Member" },
];

export default function TeamSettings() {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const handleInvite = () => {
    // Hook up your invite flow here (e.g. open an invite dialog).
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <section>
      <h1>Team settings</h1>

      <div style={{ margin: "16px 0" }}>
        <Button onClick={handleInvite}>Invite</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
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
    </section>
  );
}
