import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  EmptyState,
  Heading,
  Icon,
  List,
  Loader,
  Stack,
  Text,
} from 'serupa-ds';

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
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
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
          <Button onClick={onAddProject}>
            <Icon name="add" aria-hidden="true" />
            Add project
          </Button>
        </Stack>

        {status === 'loading' && <Loader label="Loading projects" />}

        {status === 'error' && (
          <Alert variant="danger" title="Couldn't load projects">
            <Stack gap={3} align="start">
              <Text>Something went wrong while loading your projects. Check your connection and try again.</Text>
              <Button variant="secondary" onClick={retry}>
                Try again
              </Button>
            </Stack>
          </Alert>
        )}

        {status === 'ready' &&
          (projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Add your first project to see it here."
            />
          ) : (
            <List aria-label="Projects">
              {projects.map((project) => (
                <List.Item key={project.id}>{project.name}</List.Item>
              ))}
            </List>
          ))}
      </Stack>
    </Container>
  );
}

export default ProjectsPage;
