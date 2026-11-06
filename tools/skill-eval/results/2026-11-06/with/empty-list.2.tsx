import { Button, Card, EmptyState, Heading, Icon } from 'serupa-ds';

export function ProjectsPage() {
  const handleCreate = () => {
    // Open the "create project" flow, e.g. navigate or open a Dialog.
  };

  return (
    <div className="p-4">
      <Heading level={1} className="mb-4">
        Projects
      </Heading>

      <Card>
        <EmptyState
          icon={<Icon name="folder_open" />}
          title="No projects yet"
          description="Projects keep your work organised in one place. Create your first project to get started."
          action={<Button onClick={handleCreate}>Create your first project</Button>}
        />
      </Card>
    </div>
  );
}
