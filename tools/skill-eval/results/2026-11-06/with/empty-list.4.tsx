import { Button, Card, Container, EmptyState, Heading, Icon, Stack } from 'serupa-ds';

export function ProjectsPage() {
  const handleCreate = () => {
    // Open the "create project" flow here (dialog or route).
  };

  return (
    <Container as="main">
      <Stack gap={6}>
        <Heading level={1}>Projects</Heading>

        <Card>
          <EmptyState
            icon={<Icon name="folder" />}
            title="No projects yet"
            description="Projects keep your work organized in one place. Create your first project to get started."
            action={
              <Button variant="primary" onClick={handleCreate}>
                Create your first project
              </Button>
            }
          />
        </Card>
      </Stack>
    </Container>
  );
}
