import { Button, Card } from "serupa-ds";

export default function ProjectsPage() {
  const handleCreate = () => {
    // Hook this up to your create-project flow (route, dialog, etc.)
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>Projects</h1>

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
          <p role="status">No projects yet.</p>
          <Button onClick={handleCreate}>Create your first project</Button>
        </div>
      </Card>
    </main>
  );
}
