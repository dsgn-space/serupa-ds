import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  EmptyState,
  Heading,
  List,
  Loader,
  Stack,
} from 'serupa-ds';

type Project = { id: string | number; name: string };

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; projects: Project[] };

export function ProjectsPage({ onAddProject }: { onAddProject?: () => void }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const load = useCallback((signal: AbortSignal) => {
    setState({ status: 'loading' });
    fetch('/api/projects', { signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<Project[]>;
      })
      .then((projects) => setState({ status: 'ready', projects }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({ status: 'error' });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, attempt]);

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Stack direction="row" gap={4} align="center" justify="between">
          <Heading level={1}>Projects</Heading>
          <Button onClick={onAddProject}>Add project</Button>
        </Stack>

        {state.status === 'loading' && <Loader label="Loading projects…" />}

        {state.status === 'error' && (
          <Alert variant="danger" title="Couldn't load your projects">
            <Stack gap={3}>
              <span>Something went wrong while loading the list. Check your connection and try again.</span>
              <div>
                <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
                  Try again
                </Button>
              </div>
            </Stack>
          </Alert>
        )}

        {state.status === 'ready' &&
          (state.projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Add your first project to see it here."
            />
          ) : (
            <List>
              {state.projects.map((project) => (
                <List.Item key={project.id}>{project.name}</List.Item>
              ))}
            </List>
          ))}
      </Stack>
    </Container>
  );
}
