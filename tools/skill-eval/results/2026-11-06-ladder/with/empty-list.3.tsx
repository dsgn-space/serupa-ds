import { Button, Card, Container, EmptyState, Heading, Icon, Stack } from 'serupa-ds';

export function ProjectsPage() {
  const handleCreate = () => {
    // Open the "create project" flow here.
  };

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Heading level={1}>Projects</Heading>
        <Card>
          <EmptyState
            icon={<Icon name="folder" />}
            title="No projects yet"
            description="Projects you create will show up here. Create your first one to get started."
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
