import { useCallback, useEffect, useState } from "react";
// Assumption: serupa-ds exports a `Button` component. I couldn't inspect the
// package in this session, so check the name and props against its docs.
import { Button } from "serupa-ds";

interface Project {
  id: string | number;
  name: string;
}

type Status = "loading" | "error" | "success";

export default function ProjectsPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [projects, setProjects] = useState<Project[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/projects", { signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: Project[] = await res.json();
      setProjects(data);
      setStatus("success");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleAdd = () => {
    // Hook up to your add-project flow (dialog, route, etc.).
  };

  return (
    <main>
      <header>
        <h1>Projects</h1>
        <Button onClick={handleAdd}>Add project</Button>
      </header>

      {status === "loading" && (
        <p role="status" aria-live="polite">
          Loading projects…
        </p>
      )}

      {status === "error" && (
        <div role="alert">
          <p>Couldn't load projects.</p>
          <Button onClick={() => load()}>Try again</Button>
        </div>
      )}

      {status === "success" &&
        (projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        ))}
    </main>
  );
}
