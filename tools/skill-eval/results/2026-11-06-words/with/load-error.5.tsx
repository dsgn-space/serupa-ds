import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  EmptyState,
  Heading,
  Loader,
  Stack,
} from 'serupa-ds';

type Project = { id: string | number; name: string };

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; projects: Project[] };

type ProjectsPageProps = {
  /** Called when the person chooses to add a project. */
  onAddProject?: () => void;
};

export function ProjectsPage({ onAddProject }: ProjectsPageProps) {
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
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
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

        {state.status === 'loading' && <Loader label="Loading projects" />}

        {state.status === 'error' && (
          <Alert variant="danger" title="Projects didn't load">
            <Stack gap={3} align="start">
              <span>We couldn't load your projects. Try again.</span>
              <Button variant="outline" onClick={retry}>
                Try again
              </Button>
            </Stack>
          </Alert>
        )}

        {state.status === 'ready' && state.projects.length === 0 && (
          <EmptyState
            title="No projects yet"
            description="Projects you add show up here."
            action={<Button onClick={onAddProject}>Add your first project</Button>}
          />
        )}

        {state.status === 'ready' && state.projects.length > 0 && (
          <ul className="flex flex-col gap-2 p-0 m-0 list-none">
            {state.projects.map((project) => (
              <li
                key={project.id}
                className="p-4 bg-surface border rounded-md text-text"
              >
                {project.name}
              </li>
            ))}
          </ul>
        )}
      </Stack>
    </Container>
  );
}
