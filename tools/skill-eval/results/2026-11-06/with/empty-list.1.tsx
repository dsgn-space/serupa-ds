import { Card, Container, EmptyState, Button, Heading, Icon } from 'serupa-ds';

export function ProjectsPage() {
  return (
    <Container as="main" className="py-8">
      <Heading level={1} className="mb-6">
        Projects
      </Heading>

      <Card>
        <EmptyState
          icon={<Icon name="folder" />}
          title="No projects yet"
          description="Projects keep your work in one place. Create your first one to get started."
          action={<Button onClick={() => { /* open the create-project flow */ }}>Create project</Button>}
        />
      </Card>
    </Container>
  );
}
