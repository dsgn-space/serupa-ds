import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, EmptyState, Heading, Loader, Stack } from 'serupa-ds';

type Project = { id: string | number; name: string };
type Status = 'loading' | 'error' | 'ready';

export function ProjectsPage({ onAddProject }: { onAddProject?: () => void }) {
  const [status, setStatus] = useState<Status>('loading');
  const [projects, setProjects] = useState<Project[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    fetch('/api/projects', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<Project[]>;
      })
      .then((data) => {
        setProjects(data);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Stack direction="row" gap={4} align="center" justify="between">
          <Heading level={1}>Projects</Heading>
          <Button variant="primary" onClick={onAddProject}>
            Add project
          </Button>
        </Stack>

        {status === 'loading' && <Loader label="Loading projects" />}

        {status === 'error' && (
          <Alert variant="danger" title="We couldn't load your projects">
            <Stack gap={3} align="start">
              <span>Check your connection and try again.</span>
              <Button variant="secondary" onClick={retry}>
                Try again
              </Button>
            </Stack>
          </Alert>
        )}

        {status === 'ready' && projects.length === 0 && (
          <EmptyState
            title="No projects yet"
            description="Projects you add show up here."
            action={
              <Button variant="primary" onClick={onAddProject}>
                Add your first project
              </Button>
            }
          />
        )}

        {status === 'ready' && projects.length > 0 && (
          <ul className="flex flex-col gap-2 p-0 m-0" style={{ listStyle: 'none' }}>
            {projects.map((project) => (
              <li
                key={project.id}
                className="p-4 rounded-md bg-surface border"
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
