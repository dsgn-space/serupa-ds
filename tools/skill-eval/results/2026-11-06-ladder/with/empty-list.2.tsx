import { Button, Card, EmptyState, Heading, Stack } from 'serupa-ds';

export function ProjectsPage() {
  const handleCreate = () => {
    // Start the "create project" flow here.
  };

  return (
    <Stack gap={6} className="p-4">
      <Heading level={1}>Projects</Heading>
      <Card>
        <EmptyState
          title="No projects yet"
          description="Projects keep your work organized in one place. Create your first project to get started."
          action={<Button onClick={handleCreate}>Create your first project</Button>}
        />
      </Card>
    </Stack>
  );
}
