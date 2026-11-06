import { Button, Card } from "serupa-ds";

export default function ProjectsPage() {
  const handleCreate = () => {
    // Hook up your "create project" flow here.
  };

  return (
    <main>
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
          <p>No projects yet. Create your first project to get started.</p>
          <Button onClick={handleCreate}>Create project</Button>
        </div>
      </Card>
    </main>
  );
}
