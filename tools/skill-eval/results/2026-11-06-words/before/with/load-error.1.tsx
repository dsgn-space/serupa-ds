import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, EmptyState, Heading, Loader, Stack, Text } from 'serupa-ds';

type Project = { id: string | number; name: string };
type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; projects: Project[] };

export function ProjectsPage({ onAddProject }: { onAddProject?: () => void }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
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

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Stack direction="row" gap={4} align="center" justify="between">
          <Heading level={1}>Projects</Heading>
          <Button onClick={onAddProject}>Add project</Button>
        </Stack>

        {state.status === 'loading' && (
          <Stack direction="row" gap={3} align="center">
            <Loader label="Loading projects" />
            <Text className="text-text-muted">Loading projects…</Text>
          </Stack>
        )}

        {state.status === 'error' && (
          <Alert variant="danger" title="Couldn't load projects">
            <Stack gap={3} align="start">
              <Text>Something went wrong while loading your projects. Check your connection and try again.</Text>
              <Button variant="secondary" onClick={retry}>
                Try again
              </Button>
            </Stack>
          </Alert>
        )}

        {state.status === 'ready' &&
          (state.projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Add your first project to get started."
            />
          ) : (
            <ul className="flex flex-col gap-2 p-0">
              {state.projects.map((project) => (
                <li key={project.id} className="rounded-md border p-4 bg-surface list-none">
                  <Text>{project.name}</Text>
                </li>
              ))}
            </ul>
          ))}
      </Stack>
    </Container>
  );
}
