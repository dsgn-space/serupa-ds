import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  Heading,
  Icon,
  List,
  Loader,
  Stack,
  Text,
} from 'serupa-ds';

type Project = {
  id: string | number;
  name: string;
};

type Status = 'loading' | 'error' | 'ready';

export default function ProjectsPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [projects, setProjects] = useState<Project[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/projects', { signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: Project[] = await res.json();
      setProjects(data);
      setStatus('ready');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return (
    <Container as="main" className="py-6">
      <Stack gap={4}>
        <Stack direction="row" gap={4} align="center" justify="between">
          <Heading level={1}>Projects</Heading>
          <Button onClick={() => { /* open the add-project flow */ }}>
            <Icon name="add" />
            Add project
          </Button>
        </Stack>

        {status === 'loading' && (
          <Stack direction="row" gap={2} align="center" role="status">
            <Loader />
            <Text className="text-text-muted">Loading projects…</Text>
          </Stack>
        )}

        {status === 'error' && (
          <Alert
            variant="danger"
            title="Couldn't load projects"
            action={<Button onClick={() => load()}>Try again</Button>}
          >
            Something went wrong while loading your projects. Check your connection and try again.
          </Alert>
        )}

        {status === 'ready' && (
          projects.length === 0 ? (
            <Text className="text-text-muted">No projects yet. Add your first project to get started.</Text>
          ) : (
            <List>
              {projects.map((project) => (
                <List.Item key={project.id}>{project.name}</List.Item>
              ))}
            </List>
          )
        )}
      </Stack>
    </Container>
  );
}
