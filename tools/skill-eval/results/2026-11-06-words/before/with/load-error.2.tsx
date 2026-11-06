import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, Heading, Loader, Stack, Text } from 'serupa-ds';

type Project = { id: string | number; name: string };

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; projects: Project[] };

export default function ProjectsPage({ onAddProject }: { onAddProject?: () => void }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = 'Projects';
  }, []);

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
        <Stack direction="row" gap={4} className="items-center justify-between">
          <Heading level={1}>Projects</Heading>
          <Button onClick={onAddProject}>Add project</Button>
        </Stack>

        {state.status === 'loading' && (
          <Stack direction="row" gap={3} className="items-center" role="status">
            <Loader />
            <Text className="text-text-muted">Loading projects…</Text>
          </Stack>
        )}

        {state.status === 'error' && (
          <Alert variant="danger">
            <Stack gap={3}>
              <Text>We couldn't load your projects. Check your connection and try again.</Text>
              <div>
                <Button variant="secondary" onClick={retry}>
                  Try again
                </Button>
              </div>
            </Stack>
          </Alert>
        )}

        {state.status === 'ready' &&
          (state.projects.length === 0 ? (
            <Text className="text-text-muted">No projects yet. Add your first project to get started.</Text>
          ) : (
            <ul className="m-0 list-none p-0">
              {state.projects.map((project) => (
                <li key={project.id} className="border-b border-border py-3 text-text">
                  {project.name}
                </li>
              ))}
            </ul>
          ))}
      </Stack>
    </Container>
  );
}
