import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, EmptyState, Heading, List, Loader, Stack } from 'serupa-ds';

type Project = { id: string | number; name: string };
type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; projects: Project[] };

export function ProjectsPage({ onAddProject }: { onAddProject?: () => void }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetch('/api/projects', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<Project[]>;
      })
      .then((projects) => setState({ status: 'ready', projects }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Stack direction="row" gap={4} align="center" justify="between">
          <Heading level={1}>Projects</Heading>
          <Button onClick={onAddProject}>Add project</Button>
        </Stack>

        {state.status === 'loading' && <Loader label="Loading projects" />}

        {state.status === 'error' && (
          <Alert variant="danger" title="We couldn't load your projects">
            <Stack gap={3} align="start">
              <span>Check your connection, then try again.</span>
              <Button variant="secondary" onClick={retry}>
                Try again
              </Button>
            </Stack>
          </Alert>
        )}

        {state.status === 'ready' && state.projects.length === 0 && (
          <EmptyState
            title="No projects yet"
            description="Projects you create will show up here."
            action={<Button onClick={onAddProject}>Add your first project</Button>}
          />
        )}

        {state.status === 'ready' && state.projects.length > 0 && (
          <List aria-label="Projects">
            {state.projects.map((project) => (
              <List.Item key={project.id}>{project.name}</List.Item>
            ))}
          </List>
        )}
      </Stack>
    </Container>
  );
}
