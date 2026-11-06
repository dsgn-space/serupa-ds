import { Button, Card } from "serupa-ds";

export default function ProjectsPage() {
  const projects: unknown[] = [];

  const handleCreate = () => {
    // Replace with your navigation or "create project" dialog logic.
  };

  return (
    <main>
      <h1>Projects</h1>

      {projects.length === 0 && (
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
            <p>No projects yet. Create your first one to get started.</p>
            <Button onClick={handleCreate}>Create project</Button>
          </div>
        </Card>
      )}
    </main>
  );
}
