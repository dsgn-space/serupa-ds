import { Button, Card } from "serupa-ds";

export default function ProjectsPage() {
  const handleCreate = () => {
    // Open your "create project" flow here.
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>Projects</h1>

      <Card>
        <div
          role="status"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0 }}>There are no projects yet.</p>
          <Button onClick={handleCreate}>Create your first project</Button>
        </div>
      </Card>
    </main>
  );
}
