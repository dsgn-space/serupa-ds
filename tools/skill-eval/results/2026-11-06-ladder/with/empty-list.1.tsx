import { Button, Card, Container, EmptyState, Heading, Icon, Stack, VisuallyHidden } from 'serupa-ds';

export function ProjectsPage() {
  const handleCreate = () => {
    // Open the create-project flow here.
  };

  return (
    <>
      <VisuallyHidden focusable>
        <a href="#main">Skip to content</a>
      </VisuallyHidden>

      <Container as="main" id="main" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Projects</Heading>

          <Card>
            <EmptyState
              icon={<Icon name="folder_open" />}
              title="No projects yet"
              description="Projects keep your work organized in one place. Create your first one to get started."
              action={
                <Button onClick={handleCreate}>
                  <Icon name="add" />
                  Create your first project
                </Button>
              }
            />
          </Card>
        </Stack>
      </Container>
    </>
  );
}
