import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Spinner } from "serupa-ds";

type Project = { id: string | number; name: string };

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; projects: Project[] };

export default function ProjectsPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/projects", { signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const projects: Project[] = await res.json();
      setState({ status: "success", projects });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleAdd = () => {
    // Hook up to your "add project" flow (dialog, route, etc.)
  };

  return (
    <main>
      <header>
        <h1>Projects</h1>
        <Button onClick={handleAdd}>Add project</Button>
      </header>

      {state.status === "loading" && (
        <div role="status" aria-live="polite">
          <Spinner /> Loading projects…
        </div>
      )}

      {state.status === "error" && (
        <Alert role="alert">
          <p>We couldn’t load your projects.</p>
          <Button onClick={() => load()}>Try again</Button>
        </Alert>
      )}

      {state.status === "success" &&
        (state.projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul>
            {state.projects.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        ))}
    </main>
  );
}
