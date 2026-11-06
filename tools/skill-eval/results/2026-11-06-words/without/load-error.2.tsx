import { useCallback, useEffect, useState } from "react";

type Project = { id: string | number; name: string };

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; projects: Project[] };

// Note: I couldn't inspect serupa-ds here, so this uses native elements.
// Swap in the matching serupa-ds components (Button, Spinner, Alert, List)
// where your version of the library exposes them.
export default function ProjectsPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/projects", { signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: Project[] = await res.json();
      setState({ status: "ready", projects: data });
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
    // Hook this up to your add-project flow (dialog, route, etc.).
  };

  return (
    <main>
      <header>
        <h1>Projects</h1>
        <button type="button" onClick={handleAdd}>
          Add project
        </button>
      </header>

      {state.status === "loading" && (
        <p role="status" aria-live="polite">
          Loading projects…
        </p>
      )}

      {state.status === "error" && (
        <div role="alert">
          <p>We couldn't load your projects.</p>
          <button type="button" onClick={() => load()}>
            Try again
          </button>
        </div>
      )}

      {state.status === "ready" &&
        (state.projects.length === 0 ? (
          <p>No projects yet. Add your first one.</p>
        ) : (
          <ul>
            {state.projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        ))}
    </main>
  );
}
