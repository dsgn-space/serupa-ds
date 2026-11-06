import { Button, Card } from "serupa-ds";

export default function ProjectsPage() {
  const projects: unknown[] = [];

  const handleCreate = () => {
    // Start the create-project flow here (open a dialog, navigate, etc.)
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Projects</h1>

      {projects.length === 0 && (
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <p role="status">There are no projects yet.</p>
            <Button onClick={handleCreate}>Create your first project</Button>
          </div>
        </Card>
      )}
    </main>
  );
}
