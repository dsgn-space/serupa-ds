import { useCallback, useEffect, useState } from "react";
// Assumed serupa-ds exports (I couldn't inspect the package): Button, Spinner, Alert.
// Adjust these names to match the library if they differ.
import { Alert, Button, Spinner } from "serupa-ds";

interface Project {
  id: string | number;
  name: string;
}

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
    // Hook up your add-project flow here (dialog, route, etc.).
  };

  return (
    <main>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Projects</h1>
        <Button onClick={handleAdd}>Add project</Button>
      </header>

      {state.status === "loading" && (
        <div role="status" aria-live="polite">
          <Spinner /> Loading projects…
        </div>
      )}

      {state.status === "error" && (
        <div role="alert">
          <Alert>We couldn't load your projects.</Alert>
          <Button onClick={() => load()}>Try again</Button>
        </div>
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
