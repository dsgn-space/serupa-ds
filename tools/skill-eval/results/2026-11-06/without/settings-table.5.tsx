import { useState } from "react";
// Assumption: serupa-ds exports `Button`. I couldn't inspect the package here,
// so check the export name and props (`variant`, etc.) against its docs.
import { Button } from "serupa-ds";

type Role = "Owner" | "Admin" | "Member" | "Viewer";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Aisyah Rahman", email: "aisyah@example.com", role: "Owner" },
  { id: "2", name: "Budi Santoso", email: "budi@example.com", role: "Admin" },
  { id: "3", name: "Citra Dewi", email: "citra@example.com", role: "Member" },
];

export default function TeamSettings() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  const handleInvite = () => {
    // Hook up to your invite flow (modal, route, etc.)
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <main>
      <h1>Team settings</h1>

      <div style={{ margin: "16px 0" }}>
        <Button onClick={handleInvite}>Invite</Button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <caption style={{ position: "absolute", left: -9999 }}>Team members</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">
              <span style={{ position: "absolute", left: -9999 }}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={4}>No team members yet.</td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>
                  <Button
                    onClick={() => handleRemove(member.id)}
                    aria-label={`Remove ${member.name}`}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}
